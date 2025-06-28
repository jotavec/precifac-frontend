import React, { useState, useEffect } from "react";
import {
  listarCategorias,
  adicionarCategoria,
  deletarCategoria,
  editarCategoria,
} from "../../services/categoriasApi";

import { FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";

export default function ModalCategorias({ open, onClose }) {
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [loading, setLoading] = useState(false);

  // Editar
  const [editIdx, setEditIdx] = useState(null);
  const [editNome, setEditNome] = useState("");

  // Carrega categorias ao abrir o modal
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listarCategorias().then((cats) => {
      setCategorias(cats);
      setLoading(false);
    });
  }, [open]);

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

  // Começar edição
  function startEdit(idx, nomeAtual) {
    setEditIdx(idx);
    setEditNome(nomeAtual);
  }

  // Salvar edição
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

  // Cancelar edição
  function cancelEdit() {
    setEditIdx(null);
    setEditNome("");
  }

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-categorias" style={{
        background: "#201844",
        borderRadius: 15,
        maxWidth: 370,
        margin: "80px auto",
        padding: 26,
        boxShadow: "0 4px 38px #120b29cc",
        color: "#fff"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ color: "#a78bfa", fontSize: 22, margin: 0 }}>Categorias</h2>
          <button onClick={onClose}
            style={{
              fontSize: 22, background: "none", border: "none", color: "#fff", cursor: "pointer"
            }}
            title="Fechar"
          >×</button>
        </div>
        <div style={{ margin: "22px 0 18px 0", minHeight: 180 }}>
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
                background: "#231b39",
                borderRadius: 8,
                padding: "10px 0 10px 14px",
                marginBottom: 8,
                gap: 8
              }}>
                {editIdx === idx ? (
                  <>
                    <input
                      value={editNome}
                      onChange={e => setEditNome(e.target.value)}
                      autoFocus
                      style={{
                        flex: 1,
                        background: "#2b204a",
                        color: "#fff",
                        border: "1px solid #7c3aed",
                        borderRadius: 7,
                        padding: "8px 9px",
                        fontSize: 15,
                        outline: "none"
                      }}
                      onKeyDown={e => {
                        if (e.key === "Enter") saveEdit(cat);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      disabled={loading}
                    />
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      marginLeft: "auto",
                      marginRight: 6 // cola os botões na direita
                    }}>
                      <button
                        onClick={() => saveEdit(cat)}
                        style={{
                          background: "#06e0e0",
                          border: "none",
                          color: "#201844",
                          fontSize: 17,
                          borderRadius: 6,
                          cursor: "pointer",
                          height: 28,
                          width: 28,
                          padding: "0 6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Salvar"
                        disabled={loading}
                      ><FaCheck /></button>
                      <button
                        onClick={cancelEdit}
                        style={{
                          background: "#231b39",
                          border: "none",
                          color: "#fc8181",
                          fontSize: 17,
                          borderRadius: 6,
                          cursor: "pointer",
                          height: 28,
                          width: 28,
                          padding: "0 6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Cancelar"
                        disabled={loading}
                      ><FaTimes /></button>
                    </div>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 16, flex: 1 }}>{cat.nome}</span>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      marginLeft: "auto",
                      marginRight: 6 // cola os botões na direita
                    }}>
                      <button
                        onClick={() => startEdit(idx, cat.nome)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#22d3ee",
                          fontSize: 18,
                          cursor: "pointer",
                          height: 28,
                          width: 28,
                          padding: "0 6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
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
                          color: "#fc8181",
                          fontSize: 20,
                          cursor: "pointer",
                          height: 28,
                          width: 28,
                          padding: "0 6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title={`Remover "${cat.nome}"`}
                        disabled={loading}
                      ><FaTrash /></button>
                    </div>
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
              flex: 1, background: "#2b204a", color: "#fff", border: "1px solid #7c3aed",
              borderRadius: 7, padding: "9px 10px", fontSize: 15, outline: "none"
            }}
            onKeyDown={e => { if (e.key === "Enter") handleAdicionarCategoria(); }}
            disabled={loading}
          />
          <button
            onClick={handleAdicionarCategoria}
            disabled={loading || !novaCategoria.trim()}
            style={{
              background: "#7c3aed", color: "#fff", fontWeight: 700, padding: "8px 19px",
              border: "none", borderRadius: 8, fontSize: 15, cursor: "pointer"
            }}
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
