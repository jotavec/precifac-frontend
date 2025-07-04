import React, { useRef } from "react";

export default function ModalLeitorCodigoBarras({ open, onClose, onEncontrado }) {
  const inputRef = useRef(null);

  // Foca o input ao abrir o modal
  React.useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  if (!open) return null;

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      const codigo = e.target.value.trim();
      if (codigo) {
        onEncontrado({ codBarras: codigo });
        onClose();
      }
    }
  }

  return (
    <div className="modal-backdrop" style={{
      zIndex: 1100,
      background: "rgba(16, 13, 35, 0.93)",
      backdropFilter: "blur(2px)"
    }}>
      <div
        className="modal-leitor-cod"
        style={{
          margin: "0 auto",
          maxWidth: 420,
          minWidth: 330,
          minHeight: 210,
          background: "linear-gradient(140deg, #201940 70%, #292054 100%)",
          borderRadius: 18,
          boxShadow: "0 8px 38px #0009",
          padding: "36px 32px 30px 32px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          border: "1.5px solid #b894ff"
        }}
      >
        <button
          className="modal-fechar-btn"
          onClick={onClose}
          aria-label="Fechar modal"
          type="button"
        >
          <span
            aria-hidden="true"
            style={{
              fontSize: "1.9rem",
              fontWeight: 700,
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            ×
          </span>
        </button>
        <div style={{
          fontSize: 23,
          color: "#ffe066",
          fontWeight: 700,
          marginBottom: 10,
          letterSpacing: 0.2
        }}>
          <span role="img" aria-label="código de barras" style={{ fontSize: 28, marginRight: 8 }}>🏷️</span>
          Escaneie ou digite o código de barras
        </div>
        <input
          ref={inputRef}
          type="text"
          maxLength={32}
          style={{
            width: "100%",
            fontSize: 26,
            padding: "18px 16px",
            borderRadius: 12,
            border: "2.5px solid #b894ff",
            marginTop: 22,
            background: "#1e1933",
            color: "#ffe066",
            outline: "none",
            textAlign: "center",
            boxShadow: "0 1px 10px #0005",
            fontWeight: 600,
            letterSpacing: 1
          }}
          placeholder="Escaneie aqui..."
          onKeyDown={handleKeyDown}
        />
        <div style={{
          marginTop: 24,
          fontSize: 15,
          color: "#bbb",
          fontWeight: 500,
          textAlign: "center",
          opacity: 0.8
        }}>
          <span style={{ color: "#ffe066", fontWeight: 700 }}>Pressione Enter</span> para continuar
        </div>
      </div>
    </div>
  );
}
