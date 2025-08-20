import React, { useState, useEffect } from "react";
import {
  listarMarcas,
  adicionarMarca,
  deletarMarca,
  editarMarca,
} from "../../services/marcasApi";
import { FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";

const BG_MODAL = "#fff";
const CARD_BG = "#fff";
const BORDER = "#e1e9f7";
const TITLE = "#00cfff";
const BTN_AZUL = "#00cfff";
const BTN_AZUL_HOVER = "#00b8e6";
const BTN_VERMELHO = "#ef4444";
const TEXT_COLOR = "#222";

export default function ModalMarcas({ open, onClose, refresh }) {
  const [marcas, setMarcas] = useState([]);
  const [novaMarca, setNovaMarca] = useState("");
  const [loading, setLoading] = useState(false);

  const [editIdx, setEditIdx] = useState(null);
  const [editNome, setEditNome] = useState("");

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

  function startEdit(idx, nomeAtual) {
    setEditIdx(idx);
    setEditNome(nomeAtual);
  }

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
            Marcas
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
            marcas.filter(m => m.nome && m.nome.trim() !== "").length === 0 && (
              <div style={{ color: "#bbb", fontSize: 15 }}>Nenhuma marca cadastrada ainda.</div>
            )}
          {marcas
            .filter(m => m.nome && m.nome.trim() !== "")
            .map((marca, idx) => (
              <div key={marca.id} style={{
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
                        if (e.key === "Enter") saveEdit(marca);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      disabled={loading}
                    />
                    <button
                      onClick={() => saveEdit(marca)}
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
                    >
                      <FaCheck size={18} color="#fff" style={{ display: "block", pointerEvents: "none" }} />
                    </button>
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
                    >
                      <FaTimes size={18} color={BTN_VERMELHO} style={{ display: "block", pointerEvents: "none" }} />
                    </button>
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
                    }}>{marca.nome}</span>

                    {/* ÍCONE-ONLY: EDITAR */}
                    <button
                      onClick={() => startEdit(idx, marca.nome)}
                      style={{
                        background: "#fff",
                        border: `1.4px solid ${BTN_AZUL}`,
                        color: BTN_AZUL,
                        cursor: "pointer",
                        height: 36,
                        width: 36,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 9,
                        marginLeft: 2,
                        boxShadow: "0 2px 8px #00cfff1a",
                        transition: "background .13s, border-color .13s, color .13s",
                        fontSize: 0, // evita interferência de CSS externo em ícones
                      }}
                      title="Editar"
                      aria-label="Editar"
                      disabled={loading}
                      onMouseOver={e => { e.currentTarget.style.background = "#f0fbff"; }}
                      onMouseOut={e => { e.currentTarget.style.background = "#fff"; }}
                    >
                      <span style={{ lineHeight: 0, display: "inline-flex" }}>
                        <FaEdit size={18} color={BTN_AZUL} style={{ display: "block", pointerEvents: "none" }} />
                      </span>
                    </button>

                    {/* ÍCONE-ONLY: REMOVER */}
                    <button
                      onClick={() => handleRemoverMarca(marca.id)}
                      style={{
                        background: "#fff",
                        border: `1.4px solid ${BTN_VERMELHO}`,
                        color: BTN_VERMELHO,
                        cursor: "pointer",
                        height: 36,
                        width: 36,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 9,
                        marginLeft: 6,
                        transition: "background .13s, border-color .13s, color .13s",
                        fontSize: 0,
                      }}
                      title={`Remover "${marca.nome}"`}
                      aria-label={`Remover ${marca.nome}`}
                      disabled={loading}
                      onMouseOver={e => { e.currentTarget.style.background = "#fff5f5"; }}
                      onMouseOut={e => { e.currentTarget.style.background = "#fff"; }}
                    >
                      <span style={{ lineHeight: 0, display: "inline-flex" }}>
                        <FaTrash size={18} color={BTN_VERMELHO} style={{ display: "block", pointerEvents: "none" }} />
                      </span>
                    </button>
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
            onKeyDown={e => { if (e.key === "Enter") handleAdicionarMarca(); }}
            disabled={loading}
          />
          <button
            onClick={handleAdicionarMarca}
            disabled={loading || !novaMarca.trim()}
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
