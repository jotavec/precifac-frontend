import React from "react";
import { FaPrint, FaTrashAlt } from "react-icons/fa";

export default function ModalConfiguracoes({
  open,
  onClose,
  selecionados = [],
  onDeleteSelecionados,
  onPrintSelecionados,
  totalReceitas = 0,
  onSelectAll,
  allSelected
}) {
  if (!open) return null;

  // Segurança: Desabilita exclusão se mais de 10 selecionados
  const disableDelete = selecionados.length > 10;

  return (
    <div className="central-receitas-modal-bg">
      <div
        className="central-receitas-modal"
        style={{
          maxWidth: 400,
          minWidth: 400,
          width: 400,
          height: 400,
          minHeight: 400,
          justifyContent: "flex-start",
          padding: 0,
          overflow: "visible",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="central-receitas-modal-content"
          style={{
            padding: "18px 18px 10px 18px",
            minHeight: 0,
            boxSizing: "border-box",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          {/* Cabeçalho */}
          <h2
            style={{
              color: "#2196f3",
              fontWeight: 900,
              fontSize: 24,
              marginBottom: 10,
              textAlign: "center",
              letterSpacing: 0.1,
            }}
          >
            Configurações
          </h2>

          {/* Selecionar Todos */}
          <button
            onClick={onSelectAll}
            style={{
              marginBottom: 8,
              width: "100%",
              padding: "8px 0",
              fontWeight: 800,
              fontSize: 15,
              borderRadius: 8,
              border: "1.7px solid #00cfff",
              background: allSelected
                ? "linear-gradient(90deg, #00cfff 0%, #2196f3 100%)"
                : "#fff",
              color: allSelected ? "#fff" : "#2196f3",
              cursor: "pointer",
              transition: "all .14s",
              letterSpacing: ".2px",
            }}
          >
            {allSelected ? "Desmarcar Todos" : "Selecionar Todos"}
          </button>

          {/* Contador de selecionados */}
          <div style={{
            textAlign: "center",
            marginBottom: 0,
            fontSize: 15,
            minHeight: 25,
            fontWeight: 600,
            color: "#2196f3"
          }}>
            {selecionados.length === 0
              ? "Nenhuma receita selecionada."
              : `${selecionados.length} de ${totalReceitas} selecionada${selecionados.length > 1 ? "s" : ""}.`}
          </div>

          {/* AÇÕES */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginTop: 12,
              marginBottom: 2,
            }}
          >
            {/* IMPRIMIR */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                height: "100%",
              }}
            >
              <div
                style={{
                  background: "#eaf7fc",
                  borderRadius: 16,
                  width: 75,
                  height: 75,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 6,
                  boxShadow: "0 2px 7px #00cfff16"
                }}
              >
                <FaPrint size={38} color="#2196f3" />
              </div>
              <span
                style={{
                  fontWeight: 900,
                  color: "#2196f3",
                  fontSize: 17,
                  marginBottom: 7,
                }}
              >
                Imprimir
              </span>
              <button
                onClick={onPrintSelecionados}
                disabled={selecionados.length === 0}
                style={{
                  width: 130,
                  padding: "9px 0",
                  fontWeight: 800,
                  fontSize: 15,
                  borderRadius: 7,
                  border: "none",
                  background:
                    selecionados.length > 0
                      ? "linear-gradient(90deg, #00cfff 0%, #2196f3 100%)"
                      : "#eaf7fc",
                  color: selecionados.length > 0 ? "#fff" : "#90a4ae",
                  opacity: selecionados.length === 0 ? 0.5 : 1,
                  cursor: selecionados.length === 0 ? "not-allowed" : "pointer",
                  transition: "all .13s",
                  marginBottom: 0,
                  marginTop: 0,
                  boxShadow:
                    selecionados.length > 0
                      ? "0 1px 7px #00cfff2a"
                      : "none",
                }}
              >
                Imprimir Selecionados
              </button>
            </div>
            {/* APAGAR */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                height: "100%",
              }}
            >
              <div
                style={{
                  background: "#ffd3d3",
                  borderRadius: 16,
                  width: 75,
                  height: 75,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 6,
                  boxShadow: "0 2px 7px #f1636317"
                }}
              >
                <FaTrashAlt size={38} color="#f16363" />
              </div>
              <span
                style={{
                  fontWeight: 900,
                  color: "#f16363",
                  fontSize: 17,
                  marginBottom: 7,
                }}
              >
                Apagar
              </span>
              <button
                onClick={onDeleteSelecionados}
                disabled={disableDelete || selecionados.length === 0}
                style={{
                  width: 130,
                  padding: "9px 0",
                  fontWeight: 800,
                  fontSize: 15,
                  borderRadius: 7,
                  border: "none",
                  background:
                    disableDelete || selecionados.length === 0
                      ? "#ffd3d3"
                      : "linear-gradient(90deg, #ff6e6e 0%, #f53e3e 100%)",
                  color:
                    disableDelete || selecionados.length === 0
                      ? "#f16363"
                      : "#fff",
                  opacity: selecionados.length === 0 ? 0.5 : 1,
                  cursor:
                    selecionados.length === 0 || disableDelete
                      ? "not-allowed"
                      : "pointer",
                  transition: "all .13s",
                  marginBottom: 0,
                  marginTop: 0,
                  boxShadow:
                    disableDelete || selecionados.length === 0
                      ? "none"
                      : "0 1px 7px #f1636322",
                }}
                title={
                  disableDelete
                    ? "Por segurança, só é possível apagar até 10 receitas por vez."
                    : ""
                }
              >
                Apagar Selecionados
              </button>
              {disableDelete && (
                <div
                  style={{
                    color: "#f53e3e",
                    fontWeight: 700,
                    fontSize: 11,
                    marginTop: 2,
                    textAlign: "center",
                  }}
                >
                  Por segurança, só é possível apagar até 10 receitas por vez.
                </div>
              )}
            </div>
          </div>
          {/* Fechar */}
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "11px 0",
              fontWeight: 800,
              fontSize: 16,
              borderRadius: 7,
              border: "1.7px solid #2196f3",
              background: "#fff",
              color: "#2196f3",
              marginTop: 9,
              cursor: "pointer",
              letterSpacing: ".15px"
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
