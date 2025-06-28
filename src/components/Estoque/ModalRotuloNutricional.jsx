import React, { useState } from "react";

export default function ModalRotuloNutricional({
  open,
  onClose,
  descricoes = [],
  unidades = [],
  setDescricoes,
  setUnidades
}) {
  // --------- DESCRIÇÃO ---------
  const [descInput, setDescInput] = useState("");
  const [descEditIdx, setDescEditIdx] = useState(null);

  function handleAddDescricao() {
    const novaDesc = descInput.trim();
    if (
      !novaDesc ||
      descricoes.some((d, i) => d.toLowerCase() === novaDesc.toLowerCase())
    )
      return;
    setDescricoes(prev => [...prev, novaDesc]);
    setDescInput("");
    setDescEditIdx(null);
  }
  function handleEditDescricao(idx) {
    setDescEditIdx(idx);
    setDescInput(descricoes[idx]);
  }
  function handleSaveEditDescricao(idx) {
    const novaDesc = descInput.trim();
    if (
      !novaDesc ||
      descricoes.some(
        (d, i) => d.toLowerCase() === novaDesc.toLowerCase() && i !== idx
      )
    )
      return;
    setDescricoes(prev => prev.map((d, i) => (i === idx ? novaDesc : d)));
    setDescEditIdx(null);
    setDescInput("");
  }
  function handleCancelEditDescricao() {
    setDescEditIdx(null);
    setDescInput("");
  }
  function handleDeleteDescricao(idx) {
    setDescricoes(prev => prev.filter((_, i) => i !== idx));
    setDescEditIdx(null);
    setDescInput("");
  }

  // --------- UNIDADE ---------
  const [unidInput, setUnidInput] = useState("");
  const [unidEditIdx, setUnidEditIdx] = useState(null);

  function handleAddUnidade() {
    const novaUnid = unidInput.trim();
    if (
      !novaUnid ||
      unidades.some((u, i) => u.toLowerCase() === novaUnid.toLowerCase())
    )
      return;
    setUnidades(prev => [...prev, novaUnid]);
    setUnidInput("");
    setUnidEditIdx(null);
  }
  function handleEditUnidade(idx) {
    setUnidEditIdx(idx);
    setUnidInput(unidades[idx]);
  }
  function handleSaveEditUnidade(idx) {
    const novaUnid = unidInput.trim();
    if (
      !novaUnid ||
      unidades.some(
        (u, i) => u.toLowerCase() === novaUnid.toLowerCase() && i !== idx
      )
    )
      return;
    setUnidades(prev => prev.map((u, i) => (i === idx ? novaUnid : u)));
    setUnidEditIdx(null);
    setUnidInput("");
  }
  function handleCancelEditUnidade() {
    setUnidEditIdx(null);
    setUnidInput("");
  }
  function handleDeleteUnidade(idx) {
    setUnidades(prev => prev.filter((_, i) => i !== idx));
    setUnidEditIdx(null);
    setUnidInput("");
  }

  if (!open) return null;

  return (
    <div className="modal-backdrop" style={{
      zIndex: 1000,
      position: "fixed",
      top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(24,18,42,0.82)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        background: "#22163b",
        borderRadius: 24,
        minWidth: 640,
        maxWidth: 780,
        width: "95vw",
        padding: "40px 46px 32px 46px",
        boxShadow: "0 10px 48px #11082c88",
        color: "#fff",
        position: "relative",
        border: "2.5px solid #a78bfa22",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}>
        <button
          type="button"
          style={{
            position: "absolute",
            top: 24,
            right: 34,
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: 28,
            fontWeight: 700,
            cursor: "pointer"
          }}
          onClick={onClose}
        >×</button>
        <h2 style={{
          color: "#b49cff",
          margin: 0,
          marginBottom: 28,
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: "-1.2px"
        }}>
          Categorias Nutricionais
        </h2>
        <div style={{
          display: "flex",
          gap: 40,
          alignItems: "flex-start",
          width: "100%",
          marginBottom: 16
        }}>
          {/* DESCRIÇÃO */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}>
              <b style={{ fontSize: 23, color: "#fff", letterSpacing: "-0.5px" }}>
                Descrição
              </b>
              <button
                type="button"
                style={{
                  background: "#a78bfa",
                  border: "none",
                  color: "#fff",
                  borderRadius: 13,
                  width: 56,
                  height: 44,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
                onClick={() => { setDescEditIdx(-1); setDescInput(""); }}
                title="Adicionar descrição"
              >
                <svg width="32" height="32" viewBox="0 0 512 512" fill="#fff">
                  <path d="M256 0C114.6 0 0 114.6 0 256c0 141.4 114.6 256 256 256s256-114.6 256-256c0-17.7-14.3-32-32-32s-32 14.3-32 32c0 105.9-86.1 192-192 192S64 361.9 64 256 150.1 64 256 64c44.1 0 86.4 15.1 120 43.3 13.5 11.2 33.4 9.3 44.6-4.2s9.3-33.4-4.2-44.6C367.6 39.2 313.1 16 256 16zm0 120c-17.7 0-32 14.3-32 32v64h-64c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32v-64h64c17.7 0 32-14.3 32-32s-14.3-32-32-32h-64v-64c0-17.7-14.3-32-32-32z" />
                </svg>
              </button>
            </div>
            <div style={{
              background: "#1b1330",
              minHeight: 130,
              borderRadius: 14,
              padding: 15,
              fontSize: 18,
              boxShadow: "0 1px 14px #140e2944",
              marginBottom: 2
            }}>
              {descricoes.length === 0 && descEditIdx !== -1 && (
                <div style={{ color: "#aaa" }}>Nenhuma descrição.</div>
              )}
              {descricoes.map((desc, idx) =>
                descEditIdx === idx ? (
                  <div key={idx} style={{ display: "flex", gap: 7, marginBottom: 10 }}>
                    <input
                      style={{
                        flex: 1,
                        background: "#201739",
                        color: "#fff",
                        border: "1px solid #3a2c59",
                        borderRadius: 8,
                        padding: "8px 11px",
                        fontSize: 17
                      }}
                      value={descInput}
                      onChange={e => setDescInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") handleSaveEditDescricao(idx);
                        if (e.key === "Escape") handleCancelEditDescricao();
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEditDescricao(idx)}
                      title="Salvar"
                      style={{
                        background: "#22d3ee",
                        border: "none",
                        color: "#201739",
                        borderRadius: 7,
                        fontSize: 17,
                        padding: "0 12px"
                      }}
                    >
                      ✔
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEditDescricao}
                      title="Cancelar"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#aaa",
                        fontSize: 17,
                        padding: "0 10px"
                      }}
                    >
                      ✖
                    </button>
                  </div>
                ) : (
                  <div key={idx} style={{
                    display: "flex", alignItems: "center", gap: 11, marginBottom: 9
                  }}>
                    <span style={{
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {desc}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEditDescricao(idx)}
                      title="Editar"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#19e5ff",
                        cursor: "pointer",
                        fontSize: 19,
                        padding: "0 7px"
                      }}
                    >✎</button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDescricao(idx)}
                      title="Excluir"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#fc8181",
                        cursor: "pointer",
                        fontSize: 19,
                        padding: "0 7px"
                      }}
                    >🗑</button>
                  </div>
                )
              )}
              {descEditIdx === -1 && (
                <div style={{ display: "flex", gap: 7, marginBottom: 8, marginTop: 5 }}>
                  <input
                    style={{
                      flex: 1,
                      background: "#201739",
                      color: "#fff",
                      border: "1px solid #3a2c59",
                      borderRadius: 8,
                      padding: "8px 11px",
                      fontSize: 17
                    }}
                    placeholder="Nova descrição"
                    value={descInput}
                    onChange={e => setDescInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") handleAddDescricao();
                      if (e.key === "Escape") handleCancelEditDescricao();
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddDescricao}
                    title="Salvar"
                    style={{
                      background: "#22d3ee",
                      border: "none",
                      color: "#201739",
                      borderRadius: 7,
                      fontSize: 17,
                      padding: "0 12px"
                    }}
                  >✔</button>
                  <button
                    type="button"
                    onClick={handleCancelEditDescricao}
                    title="Cancelar"
                    style={{
                      background: "none",
                      border: "none",
                      color: "#aaa",
                      fontSize: 17,
                      padding: "0 10px"
                    }}
                  >✖</button>
                </div>
              )}
            </div>
          </div>
          {/* UNIDADE DE MEDIDA */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}>
              <b style={{ fontSize: 23, color: "#fff", letterSpacing: "-0.5px" }}>
                Unidade de Medida
              </b>
              <button
                type="button"
                style={{
                  background: "#a78bfa",
                  border: "none",
                  color: "#fff",
                  borderRadius: 13,
                  width: 56,
                  height: 44,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
                onClick={() => { setUnidEditIdx(-1); setUnidInput(""); }}
                title="Adicionar unidade"
              >
                <svg width="32" height="32" viewBox="0 0 512 512" fill="#fff">
                  <path d="M256 0C114.6 0 0 114.6 0 256c0 141.4 114.6 256 256 256s256-114.6 256-256c0-17.7-14.3-32-32-32s-32 14.3-32 32c0 105.9-86.1 192-192 192S64 361.9 64 256 150.1 64 256 64c44.1 0 86.4 15.1 120 43.3 13.5 11.2 33.4 9.3 44.6-4.2s9.3-33.4-4.2-44.6C367.6 39.2 313.1 16 256 16zm0 120c-17.7 0-32 14.3-32 32v64h-64c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32v-64h64c17.7 0 32-14.3 32-32s-14.3-32-32-32h-64v-64c0-17.7-14.3-32-32-32z" />
                </svg>
              </button>
            </div>
            <div style={{
              background: "#1b1330",
              minHeight: 130,
              borderRadius: 14,
              padding: 15,
              fontSize: 18,
              boxShadow: "0 1px 14px #140e2944",
              marginBottom: 2
            }}>
              {unidades.length === 0 && unidEditIdx !== -1 && (
                <div style={{ color: "#aaa" }}>Nenhuma unidade.</div>
              )}
              {unidades.map((unid, idx) =>
                unidEditIdx === idx ? (
                  <div key={idx} style={{ display: "flex", gap: 7, marginBottom: 10 }}>
                    <input
                      style={{
                        flex: 1,
                        background: "#201739",
                        color: "#fff",
                        border: "1px solid #3a2c59",
                        borderRadius: 8,
                        padding: "8px 11px",
                        fontSize: 17
                      }}
                      value={unidInput}
                      onChange={e => setUnidInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") handleSaveEditUnidade(idx);
                        if (e.key === "Escape") handleCancelEditUnidade();
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEditUnidade(idx)}
                      title="Salvar"
                      style={{
                        background: "#22d3ee",
                        border: "none",
                        color: "#201739",
                        borderRadius: 7,
                        fontSize: 17,
                        padding: "0 12px"
                      }}
                    >✔</button>
                    <button
                      type="button"
                      onClick={handleCancelEditUnidade}
                      title="Cancelar"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#aaa",
                        fontSize: 17,
                        padding: "0 10px"
                      }}
                    >✖</button>
                  </div>
                ) : (
                  <div key={idx} style={{
                    display: "flex", alignItems: "center", gap: 11, marginBottom: 9
                  }}>
                    <span style={{
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {unid}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEditUnidade(idx)}
                      title="Editar"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#19e5ff",
                        cursor: "pointer",
                        fontSize: 19,
                        padding: "0 7px"
                      }}
                    >✎</button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUnidade(idx)}
                      title="Excluir"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#fc8181",
                        cursor: "pointer",
                        fontSize: 19,
                        padding: "0 7px"
                      }}
                    >🗑</button>
                  </div>
                )
              )}
              {unidEditIdx === -1 && (
                <div style={{ display: "flex", gap: 7, marginBottom: 8, marginTop: 5 }}>
                  <input
                    style={{
                      flex: 1,
                      background: "#201739",
                      color: "#fff",
                      border: "1px solid #3a2c59",
                      borderRadius: 8,
                      padding: "8px 11px",
                      fontSize: 17
                    }}
                    placeholder="Nova unidade"
                    value={unidInput}
                    onChange={e => setUnidInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") handleAddUnidade();
                      if (e.key === "Escape") handleCancelEditUnidade();
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddUnidade}
                    title="Salvar"
                    style={{
                      background: "#22d3ee",
                      border: "none",
                      color: "#201739",
                      borderRadius: 7,
                      fontSize: 17,
                      padding: "0 12px"
                    }}
                  >✔</button>
                  <button
                    type="button"
                    onClick={handleCancelEditUnidade}
                    title="Cancelar"
                    style={{
                      background: "none",
                      border: "none",
                      color: "#aaa",
                      fontSize: 17,
                      padding: "0 10px"
                    }}
                  >✖</button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right", marginTop: 18 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#a78bfa",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 20,
              fontWeight: 700,
              padding: "10px 38px",
              marginTop: 8,
              cursor: "pointer",
              boxShadow: "0 2px 12px #1c1336"
            }}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
