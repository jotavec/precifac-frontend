import React, { useState, useEffect } from "react";
import { FaCog, FaDownload, FaUpload } from "react-icons/fa";
import ModalEscolhaCadastro from "./ModalEscolhaCadastro";
import ModalCadastroManual from "./ModalCadastroManual";
import ModalLeitorCodigoBarras from "./ModalLeitorCodigoBarras";
import ModalImportarProdutos from "./ModalImportarProdutos";
import ConfirmDeleteModal from "../modals/ConfirmDeleteModal";
import "./Cadastro.css";

function SwitchAtivo({ checked, onChange, loading }) {
  return (
    <label className="switch-ativo" style={{ opacity: loading ? 0.5 : 1 }}>
      <input
        type="checkbox"
        checked={checked}
        disabled={loading}
        onChange={onChange}
      />
      <span className="switch-slider" />
    </label>
  );
}

function gerarCodigoUnico() {
  return Date.now().toString().slice(-6) + Math.floor(Math.random() * 900 + 100);
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
          background: "#231844",
          border: "1.5px solid #a78bfa",
          boxShadow: "0 2px 10px #160c3540",
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
        background: "#21173A",
        borderRadius: 7,
        border: "1.5px solid #b894ff",
        boxShadow: "0 2px 10px #160c3540",
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="3" fill="#292053" />
        <rect x="2" y="4" width="20" height="16" rx="3" stroke="#b894ff" strokeWidth="1.5" />
        <path d="M6 16l4-4.5 3.5 4.5 3.5-5L20 16" stroke="#ffe066" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="8.5" cy="9" r="1.2" fill="#ffe066"/>
      </svg>
    </div>
  );
}

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

  // MODAL de confirmação de exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemDelete, setItemDelete] = useState(null);

  // NOVO: controla modal de importação
  const [modalImportarOpen, setModalImportarOpen] = useState(false);

  useEffect(() => {
    fetchProdutos();
  }, []);

  async function fetchProdutos() {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/produtos");
      const data = await res.json();
      setIngredientes(Array.isArray(data) ? data : []);
    } catch {
      setIngredientes([]);
    }
    setLoading(false);
  }

  const ingredientesFiltrados = ingredientes.filter((item) =>
    (item.nome + item.codigo + (item.codBarras || "") + item.marca)
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
      });
      setManualModalOpen(true);
    }
  }
  function editarIngrediente(item) {
    setIngredienteEdit(item);
    setManualModalOpen(true);
  }

  async function handleSalvarIngrediente(ingrediente) {
    const { id, ...outros } = ingrediente;
    const payload = {
      ...outros,
      estoque: Number(ingrediente.estoque || 0),
      custoTotal: Number(ingrediente.custoTotal || 0),
      ativo: !!ingrediente.ativo,
    };

    try {
      let res;
      if (ingrediente.id) {
        res = await fetch(`http://localhost:3000/api/produtos/${ingrediente.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("http://localhost:3000/api/produtos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error("Erro ao salvar produto");
      const produtoSalvo = await res.json();

      setIngredientes((prev) => {
        const idx = prev.findIndex(item => item.id === produtoSalvo.id);
        if (idx !== -1) {
          const novaLista = [...prev];
          novaLista[idx] = produtoSalvo;
          return novaLista;
        }
        return [...prev, produtoSalvo];
      });
    } catch (e) {
      alert("Erro ao salvar produto!");
    }
    setManualModalOpen(false);
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
      const res = await fetch(`http://localhost:3000/api/produtos/${itemDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        throw new Error("Erro ao excluir produto!");
      }
      setIngredientes(prev =>
        prev.filter(item => item.id !== itemDelete.id)
      );
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

  // NOVO: Função de importação do arquivo
  async function handleImportarDados(produtos) {
  try {
    const response = await fetch("http://localhost:3000/api/produtos/importar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ produtos }),
    });
    const result = await response.json();
    console.log("Resultado importação:", result);

    if (result.erros && result.erros.length > 0) {
      alert(
        "Alguns produtos não foram importados:\n" +
        result.erros.map(erro => `Linha ${erro.linha}: ${erro.erro}`).join("\n")
      );
    } else {
      alert("Importação concluída com sucesso!");
      fetchProdutos(); // Atualiza a lista de produtos sem reload
      setRefreshCategorias(v => v + 1); // <- AQUI!
      setRefreshMarcas(v => v + 1);     // <- AQUI!
    }
    setModalImportarOpen(false);
  } catch (error) {
    alert("Erro ao importar produtos!");
  }
}

  function handleExportar() {
    alert("Exportar produtos (implemente a lógica)");
  }

  async function handleToggleAtivo(item) {
    setAtivandoId(item.id);
    try {
      const res = await fetch(`http://localhost:3000/api/produtos/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, ativo: !item.ativo }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar ativo");
      const produtoAtualizado = await res.json();
      setIngredientes(prev =>
        prev.map((i) => (i.id === item.id ? produtoAtualizado : i))
      );
    } catch (e) {
      alert("Erro ao atualizar status de ativo!");
    }
    setAtivandoId(null);
  }

  return (
    <div className="cadastro-main">
      <div className="cadastro-header">
        <h2>Cadastros</h2>
        <div
          className="cadastro-header-actions"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px"
          }}
        >
          <button className="btn-novo-cadastro" onClick={handleNovoCadastro}>
            + Novo Cadastro
          </button>
          <div
            className="cadastro-header-icones"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginLeft: "20px"
            }}
          >
            <button
              className="btn-icone-cadastro"
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "#21173A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                boxShadow: "0 1px 6px #190f3a33",
                cursor: "pointer",
                transition: "background .2s",
              }}
              title="Importar produtos"
              onClick={() => setModalImportarOpen(true)}
            >
              <FaDownload size={22} color="#a78bfa" />
            </button>
            <button
              className="btn-icone-cadastro"
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "#21173A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                boxShadow: "0 1px 6px #190f3a33",
                cursor: "pointer",
                transition: "background .2s",
              }}
              title="Exportar produtos"
              onClick={handleExportar}
            >
              <FaUpload size={22} color="#a78bfa" />
            </button>
            <div
              className="cadastro-config-icon"
              title="Configurações"
              style={{
                width: 44,
                height: 44,
                marginLeft: 0,
              }}
            >
              <FaCog size={24} color="#a78bfa" />
            </div>
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
              <th>Foto</th>
              <th>Código</th>
              <th>Cód. Barras</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Marca</th>
              <th>Unidade</th>
              <th>Estoque</th>
              <th>Custo (R$)</th>
              <th>Ativo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} style={{ textAlign: "center", padding: 24, color: "#bbb" }}>
                  Carregando...
                </td>
              </tr>
            ) : ingredientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: "center", padding: 24, color: "#bbb" }}>
                  Nenhum ingrediente encontrado.
                </td>
              </tr>
            ) : (
              ingredientesFiltrados.map((item) => (
                <tr
                  key={item.codigo}
                  className={item.ativo ? "linha-ativo" : "linha-inativo"}
                >
                  <td>
                    <FotoCelula imagem={item.imagem} nome={item.nome} />
                  </td>
                  <td>{item.codigo}</td>
                  <td>{item.codBarras || ""}</td>
                  <td>{item.nome}</td>
                  <td>{item.categoria}</td>
                  <td>{item.marca}</td>
                  <td>{item.unidade}</td>
                  <td>{item.estoque}</td>
                  <td>
                    {renderCustoTotal(item)}
                  </td>
                  <td>
                    <SwitchAtivo
                      checked={!!item.ativo}
                      onChange={() => handleToggleAtivo(item)}
                      loading={ativandoId === item.id}
                    />
                  </td>
                  <td>
                    <button className="btn-editar" onClick={() => editarIngrediente(item)}>
                      Editar
                    </button>
                  </td>
                </tr>
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
  refreshCategorias={refreshCategorias}
  refreshMarcas={refreshMarcas}
/>

      {/* Modal de confirmação de exclusão */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onRequestClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteIngrediente}
        itemLabel={itemDelete?.nome || "produto"}
      />

      {/* Modal de importação */}
      <ModalImportarProdutos
        isOpen={modalImportarOpen}
        onRequestClose={() => setModalImportarOpen(false)}
        onImportarDados={handleImportarDados}
      />
    </div>
  );
}
