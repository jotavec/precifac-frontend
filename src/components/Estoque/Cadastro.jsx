import React, { useState, useEffect } from "react";
import { FaFilter, FaDownload, FaUpload } from "react-icons/fa";
import ModalEscolhaCadastro from "./ModalEscolhaCadastro";
import ModalCadastroManual from "./ModalCadastroManual";
import ModalLeitorCodigoBarras from "./ModalLeitorCodigoBarras";
import ModalImportarProdutos from "./ModalImportarProdutos";
import ConfirmDeleteModal from "../modals/ConfirmDeleteModal";
import ModalConfiguracoesCadastro from "./ModalConfiguracoesCadastro";
import "./Cadastro.css";
import { listarMarcas, adicionarMarca } from "../../services/marcasApi";
import { listarCategorias, adicionarCategoria } from "../../services/categoriasApi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import api, { API_PREFIX } from "../../services/api";

// ================== helpers ==================
function toStr(v, { joinAll = false } = {}) {
  if (v == null) return "";
  if (Array.isArray(v)) {
    const arr = v
      .map(x => (typeof x === "string" ? x : (x?.value ?? x?.label ?? "")))
      .filter(Boolean);
    return joinAll ? arr.join(", ") : (arr[0] || "");
  }
  if (typeof v === "object") return v?.value ?? v?.label ?? "";
  return String(v);
}

function gerarCodigoUnico() {
  return Date.now().toString().slice(-6) + Math.floor(Math.random() * 900 + 100);
}

// Switch totalmente funcional
function SwitchAtivo({ checked, onChange, loading }) {
  return (
    <label className="switch-ativo" style={{ opacity: loading ? 0.5 : 1, position: "relative" }}>
      <input
        type="checkbox"
        checked={checked}
        disabled={loading}
        onChange={onChange}
        tabIndex={0}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
      />
    </label>
  );
}

function FotoCelula({ imagem, nome }) {
  if (imagem) {
    return (
      <img
        src={imagem}
        alt={nome}
        style={{
          width: 36,
          height: 36,
          objectFit: "cover",
          borderRadius: 7,
          background: "#eaf4ff",
          border: "1.5px solid #237be7",
          boxShadow: "0 2px 10px rgba(35, 123, 231, 0.15)",
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: 36,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#eaf4ff",
        borderRadius: 7,
        border: "1.5px solid #237be7",
        boxShadow: "0 2px 10px rgba(35, 123, 231, 0.15)",
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="3" fill="#dbe9f7" />
        <rect x="2" y="4" width="20" height="16" rx="3" stroke="#237be7" strokeWidth="1.5" />
        <path d="M6 16l4-4.5 3.5 4.5 3.5-5L20 16" stroke="#00cfff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="8.5" cy="9" r="1.2" fill="#00cfff"/>
      </svg>
    </div>
  );
}

const COLUNAS_CADASTRO = [
  { key: "imagem", label: "Foto" },
  { key: "codigo", label: "Código" },
  { key: "codBarras", label: "Cód. Barras" },
  { key: "nome", label: "Nome" },
  { key: "categoria", label: "Categoria" },
  { key: "marca", label: "Marca" },
  { key: "unidade", label: "Unidade" },
  { key: "estoque", label: "Estoque" },
  { key: "custoTotal", label: "Custo (R$)" },
  { key: "custoUnitario", label: "Custo Unitário" },
  { key: "estoqueMinimo", label: "Estoque Mínimo" },
  { key: "totalEmbalagem", label: "Total Embalagem" },
];

export default function Cadastro() {
  const [refreshCategorias, setRefreshCategorias] = useState(0);
  const [refreshMarcas, setRefreshMarcas] = useState(0);

  const [escolhaModalOpen, setEscolhaModalOpen] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [leitorModalOpen, setLeitorModalOpen] = useState(false);

  const [ingredienteEdit, setIngredienteEdit] = useState({});
  const [busca, setBusca] = useState("");
  const [ingredientes, setIngredientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ativandoId, setAtivandoId] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemDelete, setItemDelete] = useState(null);

  const [modalImportarOpen, setModalImportarOpen] = useState(false);
  const [modalConfigOpen, setModalConfigOpen] = useState(false);

  const [colunasPreferidas, setColunasPreferidas] = useState(null);

  useEffect(() => {
    fetchProdutos();
    fetchColunasPreferidas();
  }, []);

  // Preferências (rota sem :userId)
  async function fetchColunasPreferidas() {
    try {
      const { data } = await api.get(`${API_PREFIX}/preferencias/colunas-cadastro`);
      if (Array.isArray(data) && data.length > 0) setColunasPreferidas(data);
      else setColunasPreferidas(null);
    } catch {
      setColunasPreferidas(null);
    }
  }

  async function fetchProdutos() {
    setLoading(true);
    try {
      const { data } = await api.get(`${API_PREFIX}/produtos`);
      setIngredientes(Array.isArray(data) ? data : []);
    } catch {
      setIngredientes([]);
    }
    setLoading(false);
  }

  const ingredientesFiltrados = ingredientes.filter((item) =>
    (toStr(item.nome) + toStr(item.codigo) + toStr(item.codBarras) + toStr(item.marca))
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  function handleNovoCadastro() {
    setEscolhaModalOpen(true);
  }
  function handleEscolhaManual() {
    setEscolhaModalOpen(false);
    setIngredienteEdit({
      codigo: gerarCodigoUnico(),
      codBarras: "",
      nome: "",
      categoria: "",
      marca: "",
      unidade: "",
      estoque: "",
      custoTotal: "",
      ativo: true,
      totalEmbalagem: "",
      estoqueMinimo: ""
    });
    setManualModalOpen(true);
  }
  function handleEscolhaAutomatico() {
    setEscolhaModalOpen(false);
    setLeitorModalOpen(true);
  }
  function handleCodigoEncontrado({ codBarras, nome }) {
    setLeitorModalOpen(false);

    const encontrado = ingredientes.find(item => item.codBarras === codBarras);
    if (encontrado) {
      setIngredienteEdit(encontrado);
      setManualModalOpen(true);
    } else {
      setIngredienteEdit({
        codigo: gerarCodigoUnico(),
        codBarras,
        nome: nome || "",
        categoria: "",
        marca: "",
        unidade: "",
        estoque: "",
        custoTotal: "",
        ativo: true,
        totalEmbalagem: "",
        estoqueMinimo: ""
      });
      setManualModalOpen(true);
    }
  }
  function editarIngrediente(item) {
    setIngredienteEdit(item);
    setManualModalOpen(true);
  }

  // ——— SALVAR (normaliza tudo) ———
  async function handleSalvarIngrediente(ingrediente) {
    const { id, _omit, ...rest } = ingrediente;

    const codigo         = toStr(rest.codigo);
    const codBarras      = toStr(rest.codBarras);
    const nome           = toStr(rest.nome);
    const categoria      = toStr(rest.categoria);                 // primeiro/único
    const marca          = toStr(rest.marca, { joinAll: true });  // multi vira "A, B, C"
    const unidade        = toStr(rest.unidade);

    const estoque        = Number(rest.estoque || 0);
    const custoTotal     = Number(rest.custoTotal || 0);
    const totalEmbalagem = Number(rest.totalEmbalagem || 0);
    const custoUnitario  = totalEmbalagem > 0 && custoTotal > 0
      ? (custoTotal / totalEmbalagem)
      : 0;

    const payload = {
      codigo,
      codBarras,
      nome,
      categoria,
      marca,
      unidade,
      estoque,
      custoTotal,
      custoUnitario: custoUnitario.toFixed(4),
      ativo: !!rest.ativo,
      totalEmbalagem: toStr(rest.totalEmbalagem),
      estoqueMinimo:  toStr(rest.estoqueMinimo),
      imagem: rest.imagem ?? undefined, // se existir, mantém
    };

    try {
      let produtoSalvo;
      if (id) {
        const { data } = await api.put(`${API_PREFIX}/produtos/${id}`, payload);
        produtoSalvo = data;
      } else {
        const { data } = await api.post(`${API_PREFIX}/produtos`, payload);
        produtoSalvo = data;
      }

      setIngredientes(prev => {
        const i = prev.findIndex(p => p.id === produtoSalvo.id);
        if (i !== -1) {
          const novo = [...prev];
          novo[i] = produtoSalvo;
          return novo;
        }
        return [...prev, produtoSalvo];
      });
      setManualModalOpen(false);
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.error || e?.message || "Erro ao salvar produto!";
      alert(msg);
    }
  }

  function handleExcluirIngrediente() {
    setDeleteModalOpen(true);
    setItemDelete(ingredienteEdit);
  }

  async function confirmDeleteIngrediente() {
    if (!itemDelete || !itemDelete.id) {
      setDeleteModalOpen(false);
      return;
    }
    try {
      await api.delete(`${API_PREFIX}/produtos/${itemDelete.id}`);
      setIngredientes(prev => prev.filter(item => item.id !== itemDelete.id));
    } catch (err) {
      alert("Erro ao excluir produto!");
    }
    setDeleteModalOpen(false);
    setManualModalOpen(false);
    setItemDelete(null);
  }

  function renderCustoTotal(item) {
    const valor =
      item.custoTotal !== undefined && item.custoTotal !== null
        ? Number(item.custoTotal)
        : null;
    if (valor === null || isNaN(valor)) return "";
    return `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  }

  async function handleImportarDados(produtos) {
    try {
      const marcasExistentes = await listarMarcas();
      const categoriasExistentes = await listarCategorias();
      const marcasMap = new Map(marcasExistentes.map(m => [m.nome.toLowerCase(), m]));
      const categoriasMap = new Map(categoriasExistentes.map(c => [c.nome.toLowerCase(), c]));

      for (let produto of produtos) {
        const marcaNome = (produto.marca || "").trim();
        if (marcaNome && !marcasMap.has(marcaNome.toLowerCase())) {
          const novaMarca = await adicionarMarca(marcaNome);
          marcasMap.set(novaMarca.nome.toLowerCase(), novaMarca);
        }
        const categoriaNome = (produto.categoria || "").trim();
        if (categoriaNome && !categoriasMap.has(categoriaNome.toLowerCase())) {
          const novaCategoria = await adicionarCategoria(categoriaNome);
          categoriasMap.set(novaCategoria.nome.toLowerCase(), novaCategoria);
        }
      }

      const { data: result } = await api.post(`${API_PREFIX}/produtos/importar`, { produtos });
      if (result.erros && result.erros.length > 0) {
        alert(
          "Alguns produtos não foram importados:\n" +
          result.erros.map(erro => `Linha ${erro.linha}: ${erro.erro}`).join("\n")
        );
      } else {
        alert("Importação concluída com sucesso!");
        fetchProdutos();
        setRefreshCategorias(v => v + 1);
        setRefreshMarcas(v => v + 1);
      }
      setModalImportarOpen(false);
    } catch (error) {
      alert("Erro ao importar produtos!");
    }
  }

  function handleExportar() {
    if (!ingredientes || ingredientes.length === 0) {
      alert("Não há produtos para exportar!");
      return;
    }
    const data = ingredientes.map((item) => ({
      "Código*": item.codigo,
      "Código de Barras": item.codBarras,
      "Nome*": item.nome,
      "Categoria*": item.categoria,
      "Marca*": item.marca,
      "Unidade*": item.unidade,
      "Estoque*": item.estoque,
      "Custo Total*": item.custoTotal,
      "Custo Unitário": item.custoUnitario,
      "Ativo*": item.ativo ? "Sim" : "Não",
      "Total Embalagem*": item.totalEmbalagem,
      "Estoque Mínimo": item.estoqueMinimo
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Produtos");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, "produtos.xlsx");
  }

  async function handleToggleAtivo(item) {
    setAtivandoId(item.id);
    try {
      const { data: produtoAtualizado } = await api.put(`${API_PREFIX}/produtos/${item.id}`, {
        ...item,
        ativo: !item.ativo,
      });
      setIngredientes(prev =>
        prev.map((i) => (i.id === item.id ? produtoAtualizado : i))
      );
    } catch (e) {
      alert("Erro ao atualizar status de ativo!");
    }
    setAtivandoId(null);
  }

  const colunasTabela = (colunasPreferidas || COLUNAS_CADASTRO).filter(c => c.visivel !== false);

  function renderCelula(coluna, item) {
    if (coluna.key === "imagem") return <FotoCelula imagem={item.imagem} nome={item.nome} />;
    if (coluna.key === "custoTotal") return renderCustoTotal(item);
    if (coluna.key === "custoUnitario") return renderCustoUnitario(item);
    if (coluna.key === "marca") {
      let marcas = [];
      if (Array.isArray(item.marca)) {
        marcas = item.marca.filter(Boolean);
      } else if (typeof item.marca === "string" && item.marca) {
        marcas = item.marca.split(/[,;\n]+/).map(m => m.trim()).filter(Boolean);
      }
      if (marcas.length === 0) return null;
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-start" }}>
          {marcas.map((marca, idx) => (
            <span key={idx} style={{
              display: "flex",
              alignItems: "center",
              color: "#222",
              fontWeight: 500,
              fontSize: 15,
              lineHeight: "18px"
            }}>
              <span
                style={{
                  display: "inline-block",
                  width: 7,
                  height: 7,
                  background: "#222",
                  borderRadius: "50%",
                  marginRight: 8,
                  marginBottom: 1
                }}
              />
              {marca}
            </span>
          ))}
        </div>
      );
    }
    return item[coluna.key] || "";
  }

  function renderCustoUnitario(item) {
    const valor =
      item.custoUnitario !== undefined && item.custoUnitario !== null
        ? Number(item.custoUnitario)
        : null;
    if (valor === null || isNaN(valor)) return "";
    return `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  }

  return (
    <div className="cadastro-main">
      <div className="cadastro-header">
        <h2>Cadastros</h2>
        <div
          className="cadastro-header-actions"
          style={{ display: "flex", alignItems: "center", gap: "16px" }}
        >
          <button className="btn-novo-cadastro" onClick={handleNovoCadastro}>
            + Novo Cadastro
          </button>
          <div
            className="cadastro-header-icones"
            style={{ display: "flex", alignItems: "center", gap: "16px", marginLeft: "20px" }}
          >
            <button
              className="btn-icone-cadastro"
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "#eaf4ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                boxShadow: "0 2px 8px rgba(35, 123, 231, 0.1)",
                cursor: "pointer",
                transition: "background .2s",
              }}
              title="Importar produtos"
              onClick={() => setModalImportarOpen(true)}
            >
              <FaDownload size={22} color="#237be7" />
            </button>
            <button
              className="btn-icone-cadastro"
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "#eaf4ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                boxShadow: "0 2px 8px rgba(35, 123, 231, 0.1)",
                cursor: "pointer",
                transition: "background .2s",
              }}
              title="Exportar produtos"
              onClick={handleExportar}
            >
              <FaUpload size={22} color="#237be7" />
            </button>
            <button
              className="cadastro-config-icon"
              title="Filtrar"
              onClick={() => {
                setModalConfigOpen(true);
                setTimeout(fetchColunasPreferidas, 800);
              }}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "#eaf4ff",
                border: "none",
                padding: 0,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(35, 123, 231, 0.1)",
              }}
            >
              <FaFilter size={22} color="#237be7" />
            </button>
          </div>
        </div>
      </div>

      <div className="cadastro-filtro">
        <input
          type="text"
          placeholder="Filtrar por nome, código, marca, etc..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="cadastro-tabela-wrap">
        <table className="cadastro-tabela">
          <thead>
            <tr>
              {colunasTabela.map(coluna => (
                <th key={coluna.key}>{coluna.label}</th>
              ))}
              <th>Ativo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colunasTabela.length + 2} style={{ textAlign: "center", padding: 24, color: "#bbb" }}>
                  Carregando...
                </td>
              </tr>
            ) : ingredientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={colunasTabela.length + 2} style={{ textAlign: "center", padding: 24, color: "#bbb" }}>
                  Nenhum ingrediente encontrado.
                </td>
              </tr>
            ) : (
              ingredientesFiltrados.map((item, i) => (
                <React.Fragment key={item.id || item.codigo}>
                  <tr className={item.ativo ? "linha-ativo" : "linha-inativo"}>
                    {colunasTabela.map(coluna => (
                      <td key={coluna.key}>{renderCelula(coluna, item)}</td>
                    ))}
                    <td className="td-ativo">
                      <SwitchAtivo
                        checked={!!item.ativo}
                        onChange={() => handleToggleAtivo(item)}
                        loading={ativandoId === item.id}
                      />
                    </td>
                    <td className="td-acoes">
                      <button className="btn-editar" onClick={() => editarIngrediente(item)}>
                        Editar
                      </button>
                    </td>
                  </tr>
                  {i < ingredientesFiltrados.length - 1 && (
                    <tr>
                      <td colSpan={colunasTabela.length + 2}>
                        <div className="tabela-linha-separadora" />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modais */}
      <ModalEscolhaCadastro
        open={escolhaModalOpen}
        onClose={() => setEscolhaModalOpen(false)}
        onManual={handleEscolhaManual}
        onAuto={handleEscolhaAutomatico}
      />
      <ModalLeitorCodigoBarras
        open={leitorModalOpen}
        onClose={() => setLeitorModalOpen(false)}
        onEncontrado={handleCodigoEncontrado}
      />
      <ModalCadastroManual
        open={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        ingrediente={ingredienteEdit}
        onSave={handleSalvarIngrediente}
        onDelete={handleExcluirIngrediente}
        onChange={setIngredienteEdit}
        produtos={ingredientes}
        refreshCategorias={refreshCategorias}
        refreshMarcas={refreshMarcas}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onRequestClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteIngrediente}
        itemLabel={itemDelete?.nome || "produto"}
      />

      <ModalImportarProdutos
        isOpen={modalImportarOpen}
        onRequestClose={() => setModalImportarOpen(false)}
        onImportarDados={handleImportarDados}
      />

      <ModalConfiguracoesCadastro
        isOpen={modalConfigOpen}
        onRequestClose={() => {
          setModalConfigOpen(false);
          setTimeout(fetchColunasPreferidas, 800);
        }}
      />
    </div>
  );
}
