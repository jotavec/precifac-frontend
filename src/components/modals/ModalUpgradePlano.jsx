// src/components/modals/ModalUpgradePlano.jsx
import React, { useEffect } from "react";

/**
 * ModalUpgradePlano (debug)
 * Props:
 *   open (bool)
 *   onClose (func)
 *   irParaPlanos (func)
 */
export default function ModalUpgradePlano({ open, onClose, irParaPlanos }) {
  console.log("[ModalUpgradePlano] render -> open =", open);
  if (!open) return null;

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        console.log("[ModalUpgradePlano] ESC -> onClose()");
        onClose && onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleBackdropClick() {
    // opcional: fechar ao clicar fora
    // onClose && onClose();
  }
  function handleBoxClick(e) {
    e.stopPropagation();
  }
  function handleFechar() {
    console.log("[ModalUpgradePlano] Clicou no X -> onClose()");
    onClose && onClose();
  }
  function handleIrParaPlanos() {
    console.log("[ModalUpgradePlano] Clicou em Ver Planos -> irParaPlanos()");
    if (typeof irParaPlanos === "function") irParaPlanos();
    else onClose && onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(50, 56, 80, 0.28)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "default",
      }}
      data-testid="upgrade-backdrop"
    >
      <div
        onClick={handleBoxClick}
        style={{
          background: "#fff",
          borderRadius: 22,
          boxShadow: "0 8px 38px 0 #a0cef5cc",
          padding: "32px 38px 28px 38px",
          minWidth: 320,
          maxWidth: "92vw",
          color: "#237be7",
          textAlign: "center",
          position: "relative",
          pointerEvents: "auto",
        }}
        data-testid="upgrade-box"
      >
        <button
          type="button"
          onClick={handleFechar}
          style={{
            position: "absolute",
            top: 18,
            right: 22,
            fontSize: 20,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#555",
            lineHeight: 1,
          }}
          aria-label="Fechar"
          data-testid="upgrade-close"
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
            color: "#2196f3",
          }}
        >
          Função exclusiva para <br /> assinantes!
        </h2>

        <div style={{ fontSize: 16, color: "#6a6a6a", marginBottom: 28 }}>
          Para acessar esta funcionalidade, faça upgrade para um dos nossos planos!
        </div>

        <button
          type="button"
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
            boxShadow: "0 2px 8px #2196f31c",
          }}
          data-testid="upgrade-go-plans"
        >
          Ver Planos e Assinar
        </button>
      </div>
    </div>
  );
}
