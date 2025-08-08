import React from "react";

/**
 * ModalUpgradePlano
 * Props:
 *   open (bool): se o modal está aberto
 *   onClose (func): fecha o modal
 *   irParaPlanos (func): navega até a aba de planos (SPA)
 */
export default function ModalUpgradePlano({ open, onClose, irParaPlanos }) {
  if (!open) return null;

  // Clicar em "Ver Planos e Assinar"
  function handleIrParaPlanos() {
    if (typeof irParaPlanos === "function") irParaPlanos();
    if (onClose) onClose();
  }

  // Clicar no X
  function fecharModal() {
    if (onClose) onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(50, 56, 80, 0.28)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 22,
          boxShadow: "0 8px 38px 0 #a0cef5cc",
          padding: "32px 38px 28px 38px",
          minWidth: 320,
          maxWidth: "92vw",
          color: "#237be7",
          textAlign: "center",
          position: "relative"
        }}
      >
        {/* Botão de fechar (X) */}
        <button
          onClick={fecharModal}
          style={{
            position: "absolute",
            top: 18,
            right: 22,
            fontSize: 20,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#555"
          }}
          aria-label="Fechar"
        >
          ×
        </button>

        <div style={{ fontSize: 40, marginBottom: 18, color: "#fdab00" }}>
          <span role="img" aria-label="Cadeado">🔒</span>
        </div>
        <h2
          style={{
            fontWeight: 900,
            fontSize: "1.33rem",
            marginBottom: 12,
            color: "#2196f3"
          }}
        >
          Função exclusiva para <br /> assinantes!
        </h2>
        <div style={{ fontSize: 16, color: "#6a6a6a", marginBottom: 28 }}>
          Para acessar esta funcionalidade, faça upgrade para um dos nossos planos!
        </div>
        <button
          onClick={handleIrParaPlanos}
          style={{
            background: "#2196f3",
            color: "#fff",
            fontWeight: 800,
            border: "none",
            borderRadius: 10,
            fontSize: 16,
            padding: "12px 32px",
            marginTop: 10,
            cursor: "pointer",
            boxShadow: "0 2px 8px #2196f31c"
          }}
        >
          Ver Planos e Assinar
        </button>
      </div>
    </div>
  );
}
