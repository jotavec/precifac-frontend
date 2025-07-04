import React, { useState, useEffect } from "react";
import {
  listarMarcas,
  adicionarMarca,
  deletarMarca,
  editarMarca,
} from "../../services/marcasApi";
import { FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";

// Agora recebe refresh como prop!
export default function ModalMarcas({ open, onClose, refresh }) {
  const [marcas, setMarcas] = useState([]);
  const [novaMarca, setNovaMarca] = useState("");
  const [loading, setLoading] = useState(false);

  // Editar
  const [editIdx, setEditIdx] = useState(null);
  const [editNome, setEditNome] = useState("");

  // Agora ouve também refresh:
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listarMarcas().then((marcas) => {
      setMarcas(marcas);
      setLoading(false);
    });
  }, [open, refresh]);

  async function handleAdicionarMarca() {
    const nome = novaMarca.trim();
    if (!nome) return;
    if (marcas.some((m) => m.nome && m.nome.toLowerCase() === nome.toLowerCase())) {
      alert("Marca já existe!");
      return;
    }
    setLoading(true);
    try {
      const marca = await adicionarMarca(nome);
      if (marca && marca.nome && marca.nome.trim() !== "") {
        setMarcas((prev) => [...prev, marca]);
      }
      setNovaMarca("");
    } catch (err) {
      alert("Erro ao adicionar marca!");
    }
    setLoading(false);
  }

  async function handleRemoverMarca(id) {
    if (!window.confirm("Tem certeza que deseja remover esta marca?")) return;
    setLoading(true);
    try {
      const ok = await deletarMarca(id);
      if (ok) {
        const ms = await listarMarcas();
        setMarcas(ms);
      } else {
        alert("Erro ao remover marca: Backend não confirmou!");
      }
    } catch (err) {
      alert("Erro ao remover marca!");
    }
    setLoading(false);
  }

  // Começar edição
  function startEdit(idx, nomeAtual) {
    setEditIdx(idx);
    setEditNome(nomeAtual);
  }

  // Salvar edição
  async function saveEdit(marca) {
    const novoNome = editNome.trim();
    if (!novoNome) return;
    if (
      marcas.some(
        (m, i) =>
          i !== editIdx && m.nome && m.nome.toLowerCase() === novoNome.toLowerCase()
      )
    ) {
      alert("Já existe uma marca com esse nome!");
      return;
    }
    setLoading(true);
    try {
      const updated = await editarMarca(marca.id, novoNome);
      setMarcas((prev) =>
        prev.map((m, i) => (i === editIdx ? { ...m, nome: updated.nome } : m))
      );
      setEditIdx(null);
      setEditNome("");
    } catch (err) {
      alert("Erro ao editar marca!");
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
          <h2 style={{ color: "#a78bfa", fontSize: 22, margin: 0 }}>Marcas</h2>
          <button onClick={onClose}
            style={{
              fontSize: 22, background: "none", border: "none", color: "#fff", cursor: "pointer"
            }}
            title="Fechar"
          >×</button>
        </div>
        <div style={{ margin: "22px 0 18px 0", minHeight: 140 }}>
          {loading && <div style={{ color: "#bbb" }}>Carregando...</div>}
          {!loading &&
            marcas.filter(m => m.nome && m.nome.trim() !== "").length === 0 && (
              <div style={{ color: "#bbb", fontSize: 15 }}>Nenhuma marca cadastrada ainda.</div>
            )}
          {marcas
            .filter(m => m.nome && m.nome.trim() !== "")
            .map((marca, idx) => (
              <div key={marca.id} style={{
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
                        if (e.key === "Enter") saveEdit(marca);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      disabled={loading}
                    />
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      marginLeft: "auto",
                      marginRight: 6 // igual categorias
                    }}>
                      <button
                        onClick={() => saveEdit(marca)}
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
                    <span style={{ fontSize: 16, flex: 1 }}>{marca.nome}</span>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      marginLeft: "auto",
                      marginRight: 6 // igual categorias!
                    }}>
                      <button
                        onClick={() => startEdit(idx, marca.nome)}
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
                        onClick={() => handleRemoverMarca(marca.id)}
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
                        title={`Remover "${marca.nome}"`}
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
            value={novaMarca}
            onChange={e => setNovaMarca(e.target.value)}
            placeholder="Nova marca"
            style={{
              flex: 1, background: "#2b204a", color: "#fff", border: "1px solid #7c3aed",
              borderRadius: 7, padding: "9px 10px", fontSize: 15, outline: "none"
            }}
            onKeyDown={e => { if (e.key === "Enter") handleAdicionarMarca(); }}
            disabled={loading}
          />
          <button
            onClick={handleAdicionarMarca}
            disabled={loading || !novaMarca.trim()}
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
