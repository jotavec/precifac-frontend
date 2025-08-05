import React, { useState, useEffect } from "react";
import {
  listarCategorias,
  adicionarCategoria,
  deletarCategoria,
  editarCategoria,
} from "../../services/categoriasApi";
import { FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";

const BG_MODAL = "#fff";
const CARD_BG = "#fff";
const BORDER = "#e1e9f7";
const TITLE = "#00cfff";
const BTN_AZUL = "#00cfff";
const BTN_AZUL_HOVER = "#00b8e6";
const BTN_VERMELHO = "#ef4444";
const TEXT_COLOR = "#222";

export default function ModalCategorias({ open, onClose, refresh }) {
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [loading, setLoading] = useState(false);

  const [editIdx, setEditIdx] = useState(null);
  const [editNome, setEditNome] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listarCategorias().then((cats) => {
      setCategorias(cats);
      setLoading(false);
    });
  }, [open, refresh]);

  async function handleAdicionarCategoria() {
    const nome = novaCategoria.trim();
    if (!nome) return;
    if (categorias.some((cat) => cat.nome && cat.nome.toLowerCase() === nome.toLowerCase())) {
      alert("Categoria já existe!");
      return;
    }
    setLoading(true);
    try {
      const cat = await adicionarCategoria(nome);
      if (cat && cat.nome && cat.nome.trim() !== "") {
        setCategorias((prev) => [...prev, cat]);
      }
      setNovaCategoria("");
    } catch (err) {
      alert("Erro ao adicionar categoria!");
    }
    setLoading(false);
  }

  async function handleRemoverCategoria(id) {
    if (!window.confirm("Tem certeza que deseja remover esta categoria?")) return;
    setLoading(true);
    try {
      const ok = await deletarCategoria(id);
      if (ok) {
        const cats = await listarCategorias();
        setCategorias(cats);
      } else {
        alert("Erro ao remover categoria: Backend não confirmou!");
      }
    } catch (err) {
      alert("Erro ao remover categoria!");
      console.error(err);
    }
    setLoading(false);
  }

  function startEdit(idx, nomeAtual) {
    setEditIdx(idx);
    setEditNome(nomeAtual);
  }

  async function saveEdit(cat) {
    const novoNome = editNome.trim();
    if (!novoNome) return;
    if (
      categorias.some(
        (c, i) =>
          i !== editIdx && c.nome && c.nome.toLowerCase() === novoNome.toLowerCase()
      )
    ) {
      alert("Já existe uma categoria com esse nome!");
      return;
    }
    setLoading(true);
    try {
      const updated = await editarCategoria(cat.id, novoNome);
      setCategorias((prev) =>
        prev.map((c, i) => (i === editIdx ? { ...c, nome: updated.nome } : c))
      );
      setEditIdx(null);
      setEditNome("");
    } catch (err) {
      alert("Erro ao editar categoria!");
    }
    setLoading(false);
  }

  function cancelEdit() {
    setEditIdx(null);
    setEditNome("");
  }

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div
        style={{
          background: BG_MODAL,
          borderRadius: 20,
          maxWidth: 400,
          minWidth: 340,
          margin: "90px auto",
          padding: 28,
          boxShadow: "0 8px 40px #00cfff23",
          border: `2.3px solid ${BORDER}`,
          color: TEXT_COLOR,
          fontFamily: "Roboto, Arial, sans-serif",
        }}
      >
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10
        }}>
          <h2 style={{
            color: TITLE,
            fontSize: 23,
            margin: 0,
            fontWeight: 900,
            letterSpacing: 0.3
          }}>
            Categorias
          </h2>
          <button
            onClick={onClose}
            style={{
              fontSize: 28,
              background: "none",
              border: "none",
              color: TITLE,
              cursor: "pointer",
              fontWeight: 800,
              marginLeft: 16,
              lineHeight: 1
            }}
            title="Fechar"
          >×</button>
        </div>
        <div style={{ margin: "18px 0 18px 0", minHeight: 120 }}>
          {loading && <div style={{ color: "#bbb" }}>Carregando...</div>}
          {!loading &&
            categorias.filter(cat => cat.nome && cat.nome.trim() !== "").length === 0 && (
              <div style={{ color: "#bbb", fontSize: 15 }}>Nenhuma categoria cadastrada ainda.</div>
            )}
          {categorias
            .filter(cat => cat.nome && cat.nome.trim() !== "")
            .map((cat, idx) => (
              <div key={cat.id} style={{
                display: "flex",
                alignItems: "center",
                background: CARD_BG,
                borderRadius: 12,
                border: `1.5px solid ${BORDER}`,
                boxShadow: "0 2px 8px #a0cef520",
                padding: "10px 0 10px 14px",
                marginBottom: 10,
                gap: 8,
                minHeight: 36,
                transition: "border 0.17s",
              }}>
                {editIdx === idx ? (
                  <>
                    <input
                      value={editNome}
                      onChange={e => setEditNome(e.target.value)}
                      autoFocus
                      style={{
                        flex: 1,
                        background: "#fff",
                        color: TEXT_COLOR,
                        border: `1.7px solid ${BTN_AZUL}`,
                        borderRadius: 9,
                        padding: "8px 9px",
                        fontSize: 15,
                        outline: "none",
                        fontWeight: 600,
                        marginRight: 4,
                      }}
                      onKeyDown={e => {
                        if (e.key === "Enter") saveEdit(cat);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      disabled={loading}
                    />
                    <button
                      onClick={() => saveEdit(cat)}
                      style={{
                        background: BTN_AZUL,
                        border: "none",
                        color: "#fff",
                        fontSize: 19,
                        borderRadius: 9,
                        cursor: "pointer",
                        height: 32,
                        width: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: 2,
                        boxShadow: "0 2px 8px #00cfff33",
                        transition: "background .13s"
                      }}
                      title="Salvar"
                      disabled={loading}
                    ><FaCheck /></button>
                    <button
                      onClick={cancelEdit}
                      style={{
                        background: "#fff",
                        border: `1.1px solid ${BORDER}`,
                        color: BTN_VERMELHO,
                        fontSize: 19,
                        borderRadius: 9,
                        cursor: "pointer",
                        height: 32,
                        width: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: 3
                      }}
                      title="Cancelar"
                      disabled={loading}
                    ><FaTimes /></button>
                  </>
                ) : (
                  <>
                    <span style={{
                      fontSize: 16,
                      flex: 1,
                      color: TEXT_COLOR,
                      fontWeight: 600,
                      letterSpacing: 0.05,
                      marginRight: 5
                    }}>{cat.nome}</span>
                    <button
                      onClick={() => startEdit(idx, cat.nome)}
                      style={{
                        background: "none",
                        border: "none",
                        color: BTN_AZUL,
                        fontSize: 20,
                        cursor: "pointer",
                        height: 32,
                        width: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: 2,
                        transition: "color 0.15s"
                      }}
                      title="Editar"
                      disabled={loading}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleRemoverCategoria(cat.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: BTN_VERMELHO,
                        fontSize: 21,
                        cursor: "pointer",
                        height: 32,
                        width: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: 3
                      }}
                      title={`Remover "${cat.nome}"`}
                      disabled={loading}
                    ><FaTrash /></button>
                  </>
                )}
              </div>
            ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={novaCategoria}
            onChange={e => setNovaCategoria(e.target.value)}
            placeholder="Nova categoria"
            style={{
              flex: 1,
              background: "#fff",
              color: TEXT_COLOR,
              border: `1.7px solid ${BORDER}`,
              borderRadius: 9,
              padding: "10px 11px",
              fontSize: 15,
              outline: "none",
              fontWeight: 600,
              marginRight: 0,
            }}
            onKeyDown={e => { if (e.key === "Enter") handleAdicionarCategoria(); }}
            disabled={loading}
          />
          <button
            onClick={handleAdicionarCategoria}
            disabled={loading || !novaCategoria.trim()}
            style={{
              background: BTN_AZUL,
              color: "#fff",
              fontWeight: 800,
              padding: "0 22px",
              height: 40,
              border: "none",
              borderRadius: 9,
              fontSize: 15.5,
              cursor: "pointer",
              letterSpacing: ".05em",
              boxShadow: "0 2px 9px #00cfff2a",
              transition: "background .13s",
              minWidth: 112,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            onMouseOver={e => e.currentTarget.style.background = BTN_AZUL_HOVER}
            onMouseOut={e => e.currentTarget.style.background = BTN_AZUL}
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
