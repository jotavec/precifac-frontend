import React, { useRef } from "react";
import ReactToPrint from "react-to-print";
import FichaTecnicaImpressao from "./FichaTecnicaImpressao";

export default function ModalPreviewImpressao({
  open,
  onClose,
  receitasSelecionadas = [],
  perfil = {},
}) {
  const printRef = useRef();

  // DEBUG: mostrar receitas selecionadas no console para verificar ingredientes
  console.log("DEBUG receitasSelecionadas:", receitasSelecionadas);

  if (!open) return null;

  return (
    <div className="central-receitas-modal-bg" style={{ zIndex: 999 }}>
      <div
        className="central-receitas-modal"
        style={{
          maxWidth: 680,
          minWidth: 370,
          width: "95vw",
          minHeight: 480,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          borderRadius: 22,
        }}
      >
        <div
          className="central-receitas-modal-content"
          style={{
            padding: "18px 24px 18px 24px",
            minHeight: 0,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          <h2
            style={{
              color: "#2196f3",
              fontWeight: 900,
              fontSize: 25,
              marginBottom: 18,
              textAlign: "center",
              letterSpacing: ".02em",
            }}
          >
            Visualização de Impressão
          </h2>

          {/* Preview imprimível */}
          <div
            ref={printRef}
            style={{
              background: "#fafdff",
              border: "2px solid #eaf3ff",
              borderRadius: 14,
              padding: "16px 16px 8px 16px",
              marginBottom: 22,
              minHeight: 220,
              fontSize: 16,
              overflowY: "auto",
              maxHeight: 380,
            }}
          >
            {receitasSelecionadas.length === 0 ? (
              <div
                style={{ textAlign: "center", color: "#999", fontSize: 18, padding: 36 }}
              >
                Nenhuma receita selecionada para imprimir.
              </div>
            ) : (
              receitasSelecionadas.map((r, idx) => (
                <FichaTecnicaImpressao key={r.id || idx} receita={r} perfil={perfil} />
              ))
            )}
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
            <ReactToPrint
              trigger={() => (
                <button
                  style={{
                    flex: 1,
                    background: "linear-gradient(90deg, #00cfff 0%, #2196f3 100%)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 17,
                    borderRadius: 7,
                    border: "none",
                    padding: "14px 0",
                    cursor: receitasSelecionadas.length === 0 ? "not-allowed" : "pointer",
                    opacity: receitasSelecionadas.length === 0 ? 0.5 : 1,
                  }}
                  disabled={receitasSelecionadas.length === 0}
                >
                  Imprimir Agora
                </button>
              )}
              content={() => printRef.current}
              pageStyle="@media print { body { -webkit-print-color-adjust: exact; } }"
            />
            <button
              onClick={onClose}
              style={{
                flex: 1,
                background: "#fff",
                color: "#2196f3",
                fontWeight: 800,
                fontSize: 17,
                borderRadius: 7,
                border: "2px solid #2196f3",
                padding: "14px 0",
                cursor: "pointer",
              }}
            >
              Fechar Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
