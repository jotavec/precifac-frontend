import React, { useState, useEffect } from "react";
import {
  listarMarcas,
  adicionarMarca,
  deletarMarca,
  editarMarca,
} from "../../services/marcasApi";
import { FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import { useAuth } from "../../App";

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

  // Integrar AuthContext para checar se há usuário logado
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listarMarcas().then((marcas) => {
      setMarcas(marcas);
      setLoading(false);
    });
  }, [open, refresh]);

  async function handleAdicionarMarca() {
    if (!isAuthenticated) {
      alert("Você precisa estar logado para adicionar marcas!");
      return;
    }
    
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
    if (!isAuthenticated) {
      alert("Você precisa estar logado para remover marcas!");
      return;
    }
    
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
    if (!isAuthenticated) {
      alert("Você precisa estar logado para editar marcas!");
      return;
    }
    
    setEditIdx(idx);
    setEditNome(nomeAtual);
  }

  async function saveEdit(marca) {
    if (!isAuthenticated) {
      alert("Você precisa estar logado para editar marcas!");
      return;
    }
    
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

        {!isAuthenticated && (
          <div style={{
            background: "#fff3cd",
            color: "#856404",
            padding: "8px 12px",
            borderRadius: 8,
            fontSize: 14,
            marginBottom: 16,
            border: "1px solid #ffeaa7"
          }}>
            ⚠️ Você precisa estar logado para criar, editar ou remover marcas.
          </div>
        )}

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
                        background: isAuthenticated ? "#fff" : "#f8f9fa",
                        border: `1.4px solid ${isAuthenticated ? BTN_AZUL : "#dee2e6"}`,
                        color: isAuthenticated ? BTN_AZUL : "#6c757d",
                        cursor: isAuthenticated ? "pointer" : "not-allowed",
                        height: 36,
                        width: 36,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 9,
                        marginLeft: 2,
                        boxShadow: isAuthenticated ? "0 2px 8px #00cfff1a" : "none",
                        transition: "background .13s, border-color .13s, color .13s",
                        fontSize: 0, // evita interferência de CSS externo em ícones
                        opacity: isAuthenticated ? 1 : 0.6
                      }}
                      title={isAuthenticated ? "Editar" : "Faça login para editar"}
                      aria-label={isAuthenticated ? "Editar" : "Faça login para editar"}
                      disabled={loading || !isAuthenticated}
                      onMouseOver={e => { 
                        if (isAuthenticated) e.currentTarget.style.background = "#f0fbff"; 
                      }}
                      onMouseOut={e => { 
                        if (isAuthenticated) e.currentTarget.style.background = "#fff"; 
                      }}
                    >
                      <span style={{ lineHeight: 0, display: "inline-flex" }}>
                        <FaEdit size={18} color={isAuthenticated ? BTN_AZUL : "#6c757d"} style={{ display: "block", pointerEvents: "none" }} />
                      </span>
                    </button>

                    {/* ÍCONE-ONLY: REMOVER */}
                    <button
                      onClick={() => handleRemoverMarca(marca.id)}
                      style={{
                        background: isAuthenticated ? "#fff" : "#f8f9fa",
                        border: `1.4px solid ${isAuthenticated ? BTN_VERMELHO : "#dee2e6"}`,
                        color: isAuthenticated ? BTN_VERMELHO : "#6c757d",
                        cursor: isAuthenticated ? "pointer" : "not-allowed",
                        height: 36,
                        width: 36,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 9,
                        marginLeft: 6,
                        transition: "background .13s, border-color .13s, color .13s",
                        fontSize: 0,
                        opacity: isAuthenticated ? 1 : 0.6
                      }}
                      title={isAuthenticated ? `Remover "${marca.nome}"` : "Faça login para remover"}
                      aria-label={isAuthenticated ? `Remover ${marca.nome}` : "Faça login para remover"}
                      disabled={loading || !isAuthenticated}
                      onMouseOver={e => { 
                        if (isAuthenticated) e.currentTarget.style.background = "#fff5f5"; 
                      }}
                      onMouseOut={e => { 
                        if (isAuthenticated) e.currentTarget.style.background = "#fff"; 
                      }}
                    >
                      <span style={{ lineHeight: 0, display: "inline-flex" }}>
                        <FaTrash size={18} color={isAuthenticated ? BTN_VERMELHO : "#6c757d"} style={{ display: "block", pointerEvents: "none" }} />
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
            placeholder={isAuthenticated ? "Nova marca" : "Faça login para adicionar marcas"}
            style={{
              flex: 1,
              background: isAuthenticated ? "#fff" : "#f8f9fa",
              color: isAuthenticated ? TEXT_COLOR : "#6c757d",
              border: `1.7px solid ${isAuthenticated ? BORDER : "#dee2e6"}`,
              borderRadius: 9,
              padding: "10px 11px",
              fontSize: 15,
              outline: "none",
              fontWeight: 600,
              marginRight: 0,
              opacity: isAuthenticated ? 1 : 0.6
            }}
            onKeyDown={e => { if (e.key === "Enter" && isAuthenticated) handleAdicionarMarca(); }}
            disabled={loading || !isAuthenticated}
          />
          <button
            onClick={handleAdicionarMarca}
            disabled={loading || !novaMarca.trim() || !isAuthenticated}
            style={{
              background: isAuthenticated ? BTN_AZUL : "#6c757d",
              color: "#fff",
              fontWeight: 800,
              padding: "0 22px",
              height: 40,
              border: "none",
              borderRadius: 9,
              fontSize: 15.5,
              cursor: isAuthenticated ? "pointer" : "not-allowed",
              letterSpacing: ".05em",
              boxShadow: isAuthenticated ? "0 2px 9px #00cfff2a" : "none",
              transition: "background .13s",
              minWidth: 112,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: isAuthenticated ? 1 : 0.6
            }}
            title={isAuthenticated ? "Adicionar marca" : "Faça login para adicionar marcas"}
            onMouseOver={e => {
              if (isAuthenticated) e.currentTarget.style.background = BTN_AZUL_HOVER;
            }}
            onMouseOut={e => {
              if (isAuthenticated) e.currentTarget.style.background = BTN_AZUL;
            }}
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
