import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import ConfirmDeleteModal from "../modals/ConfirmDeleteModal";
import ModalDespesasFixas from "./ModalDespesasFixas";
import api from "../../services/api";
import "./DespesasFixas.css";

export default function DespesasFixas() {
  const [subcategorias, setSubcategorias] = useState([]);
  const [subcatIdx, setSubcatIdx] = useState(0);
  const [editandoSubcatIdx, setEditandoSubcatIdx] = useState(null);
  const [nomeSubcatTemp, setNomeSubcatTemp] = useState("");
  const [editandoDespesaIdx, setEditandoDespesaIdx] = useState(null);
  const [despesaTemp, setDespesaTemp] = useState({ nome: "", valor: "" });
  const [modalAberto, setModalAberto] = useState(false);
  const [modalDelete, setModalDelete] = useState({ open: false, idx: null });

  useEffect(() => {
    api.get('/despesasfixas/subcategorias')
      .then(res => setSubcategorias(Array.isArray(res.data) ? res.data : []))
      .catch(() => setSubcategorias([]));
  }, []);

  const somaTotalTodasCategorias = subcategorias.reduce(
    (acc, sc) =>
      acc +
      (sc.fixedCosts
        ? sc.fixedCosts.reduce((a, d) => a + (Number(d.value) || 0), 0)
        : 0),
    0
  );

  async function handleAddSubcat() {
    try {
      const res = await api.post('/despesasfixas/subcategorias', { name: "Nova Categoria" });
      const novaSubcat = res.data;
      setSubcategorias(subcats => [...subcats, { ...novaSubcat, fixedCosts: [] }]);
      setSubcatIdx(subcategorias.length);
      setEditandoSubcatIdx(subcategorias.length);
      setNomeSubcatTemp("");
    } catch { }
  }

  async function handleSalvarSubcat(idx) {
    if (!nomeSubcatTemp.trim()) return;
    const subcat = subcategorias[idx];
    try {
      const res = await api.put(`/despesasfixas/subcategorias/${subcat.id}`, { name: nomeSubcatTemp.trim() });
      const atualizada = res.data;
      setSubcategorias(subcats => subcats.map((sc, i) => i === idx ? { ...sc, name: atualizada.name } : sc));
      setEditandoSubcatIdx(null);
      setNomeSubcatTemp("");
    } catch { }
  }

  function handleEditarSubcat(idx) {
    setEditandoSubcatIdx(idx);
    setNomeSubcatTemp(subcategorias[idx].name);
  }

  async function handleApagarSubcat(idx) {
    const subcat = subcategorias[idx];
    try {
      await api.delete(`/despesasfixas/subcategorias/${subcat.id}`);
      setSubcategorias(subcats => subcats.filter((_, i) => i !== idx));
      setSubcatIdx(0);
      setEditandoSubcatIdx(null);
    } catch { }
  }

  function handleAddDespesa() {
    setEditandoDespesaIdx("novo");
    setDespesaTemp({ nome: "", valor: "" });
    setModalAberto(true);
  }

  async function handleSalvarDespesa(despesa) {
    if (!despesa.nome.trim() || despesa.valor === "") return;
    const subcat = subcategorias[subcatIdx];
    const valorNumber = Number(String(despesa.valor).replace(/\./g, "").replace(",", "."));
    try {
      if (editandoDespesaIdx === "novo") {
        const res = await api.post(`/despesasfixas/subcategorias/${subcat.id}/custos`, 
          { name: despesa.nome.trim(), value: valorNumber });
        const novoCusto = res.data;
        setSubcategorias(subcats => subcats.map((sc, i) =>
          i === subcatIdx ? { ...sc, fixedCosts: [...sc.fixedCosts, novoCusto] } : sc
        ));
      } else {
        const custo = subcategorias[subcatIdx].fixedCosts[editandoDespesaIdx];
        const res = await api.put(`/despesasfixas/custos/${custo.id}`, 
          { name: despesa.nome.trim(), value: valorNumber });
        const atualizado = res.data;
        setSubcategorias(subcats => subcats.map((sc, i) =>
          i === subcatIdx
            ? { ...sc, fixedCosts: sc.fixedCosts.map((c, j) => j === editandoDespesaIdx ? atualizado : c) }
            : sc
        ));
      }
    } catch { }
    setEditandoDespesaIdx(null);
    setDespesaTemp({ nome: "", valor: "" });
    setModalAberto(false);
  }

  function handleEditarDespesa(idx) {
    setEditandoDespesaIdx(idx);
    const custo = subcategorias[subcatIdx].fixedCosts[idx];
    setDespesaTemp({
      nome: custo.name,
      valor: custo.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    });
    setModalAberto(true);
  }

  async function handleExcluirDespesa(idx) {
    const custo = subcategorias[subcatIdx].fixedCosts[idx];
    try {
      await api.delete(`/despesasfixas/custos/${custo.id}`);
      setSubcategorias(subcats => subcats.map((sc, i) =>
        i === subcatIdx
          ? { ...sc, fixedCosts: sc.fixedCosts.filter((_, j) => j !== idx) }
          : sc
      ));
    } catch { }
    setEditandoDespesaIdx(null);
    setDespesaTemp({ nome: "", valor: "" });
    setModalAberto(false);
  }

  const somaSubcat = subcat =>
    subcat?.fixedCosts?.reduce((acc, d) => acc + (Number(d.value) || 0), 0) || 0;

  const formatarValor = (valor) => {
    if (!valor) return "R$ 0,00";
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  function fecharModal() {
    setEditandoDespesaIdx(null);
    setModalAberto(false);
    setDespesaTemp({ nome: "", valor: "" });
  }

  if (!subcategorias.length) {
    return (
      <div className="painel-root">
        <div className="painel-header">
          <div>
            <div className="painel-titulo-pagina">
              Despesas Fixas
            </div>
          </div>
        </div>
        <div style={{ display: "flex", width: "100%" }}>
          <div className="painel-menu">
            <button className="btn-azul-grad" onClick={handleAddSubcat}>
              + Adicionar categoria
            </button>
            <div style={{
              marginTop: 18,
              color: "#425276",
              background: "#fff",
              borderRadius: 13,
              padding: "18px 16px",
              fontWeight: 700,
              boxShadow: "0 2px 18px #00cfff10"
            }}>
              Nenhuma categoria cadastrada.
            </div>
          </div>
          <div className="painel-content" />
        </div>
      </div>
    );
  }

  const subcat = subcategorias[subcatIdx];

  return (
    <div className="painel-root">
      {/* HEADER PADRÃO, igual folha de pagamento */}
      <div className="painel-header">
        <div>
          <div className="painel-titulo-pagina">
            Despesas Fixas
          </div>
        </div>
        <div className="painel-total-geral">
          <span>Total geral</span>
          <b>
            {Number(somaTotalTodasCategorias).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </b>
        </div>
      </div>
      {/* Bloco esquerdo: MENU DE CATEGORIAS */}
      <div style={{ display: "flex", width: "100%" }}>
        <div className="painel-menu">
          <button className="btn-azul-grad" onClick={handleAddSubcat}>
            + Adicionar categoria
          </button>
          <div className="painel-menu-list">
            {subcategorias.map((sc, i) => (
              <div
                key={sc.id}
                className={`painel-menu-item${subcatIdx === i ? " ativo" : ""}`}
                onClick={() => {
                  if (editandoSubcatIdx !== i) {
                    setSubcatIdx(i);
                    setEditandoDespesaIdx(null);
                    setEditandoSubcatIdx(null);
                  }
                }}
              >
                {editandoSubcatIdx === i ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      width: "100%",
                    }}
                  >
                    <input
                      className="painel-menu-editinput"
                      style={{ flex: 1 }}
                      value={nomeSubcatTemp}
                      onChange={e => setNomeSubcatTemp(e.target.value)}
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === "Enter") handleSalvarSubcat(i);
                        if (e.key === "Escape") setEditandoSubcatIdx(null);
                      }}
                      onClick={e => e.stopPropagation()}
                    />
                    <button
                      className="btn-chip-acao"
                      onClick={e => { e.stopPropagation(); handleSalvarSubcat(i); }}
                      title="Salvar"
                    >
                      <FiCheck size={18} />
                    </button>
                    <button
                      className="btn-chip-acao"
                      onClick={e => { e.stopPropagation(); setEditandoSubcatIdx(null); }}
                      title="Cancelar"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="painel-menu-nome">
                      {sc.name}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <button
                        className="btn-chip-acao"
                        onClick={e => { e.stopPropagation(); setSubcatIdx(i); handleEditarSubcat(i); }}>
                        <FiEdit2 size={17} />
                      </button>
                      <button
                        className="btn-chip-acao"
                        onClick={e => { e.stopPropagation(); setModalDelete({ open: true, idx: i }); }}>
                        <FiTrash2 size={17} />
                      </button>
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bloco direito: CONTEÚDO DA CATEGORIA */}
        <div className="painel-content">
          {/* Total no topo direito */}
          <div className="painel-content-total-top">
            Total: <span>{formatarValor(somaSubcat(subcat))}</span>
          </div>
          <div className="painel-content-titulo">
            {subcat?.name}
          </div>
          <table className="painel-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Valor (R$)</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {subcat?.fixedCosts?.length === 0 && (
                <tr>
                  <td colSpan={3} className="painel-table-empty">
                    Nenhum custo cadastrado.<br />
                    Clique em <b>Adicionar custo</b> para começar.
                  </td>
                </tr>
              )}
              {subcat?.fixedCosts?.map((custo, idx) => (
                <tr key={custo.id}>
                  <td>{custo.name}</td>
                  <td className="painel-table-valor">{formatarValor(custo.value)}</td>
                  <td>
                    <button
                      className="btn-chip-acao"
                      onClick={() => handleEditarDespesa(idx)}>
                      <FiEdit2 size={19} />
                    </button>
                    <button
                      className="btn-chip-acao"
                      onClick={() => handleExcluirDespesa(idx)}>
                      <FiTrash2 size={19} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="painel-content-actions" style={{ display: "flex", justifyContent: "flex-end", marginTop: 22 }}>
            <button className="btn-azul-grad" onClick={handleAddDespesa}>
              + Adicionar custo
            </button>
          </div>
        </div>

        {/* MODAL SEPARADO */}
        <ModalDespesasFixas
          open={modalAberto}
          onClose={fecharModal}
          despesa={despesaTemp}
          onChange={setDespesaTemp}
          onSave={handleSalvarDespesa}
          editar={editandoDespesaIdx !== "novo"}
        />

        {/* Modal de confirmação de exclusão de subcategoria */}
        <ConfirmDeleteModal
          isOpen={modalDelete.open}
          onRequestClose={() => setModalDelete({ open: false, idx: null })}
          onConfirm={() => {
            if (modalDelete.idx !== null) handleApagarSubcat(modalDelete.idx);
            setModalDelete({ open: false, idx: null });
          }}
          itemLabel="categoria"
        />
      </div>
    </div>
  );
}
