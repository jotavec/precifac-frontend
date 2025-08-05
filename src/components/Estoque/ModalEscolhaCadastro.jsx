import React from "react";
import { FiFileText } from "react-icons/fi";

export default function ModalEscolhaCadastro({ open, onClose, onManual, onAuto }) {
  if (!open) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 2000,
      background: "rgba(16, 16, 40, 0.22)",
      backdropFilter: "blur(2px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 22,
        minWidth: 560,
        maxWidth: 650,
        width: "92vw",
        boxShadow: "0 8px 38px 0 #38a1ff23, 0 1.5px 0.5px #2196f366",
        padding: "2.7rem 2.5rem 2.2rem 2.5rem",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        {/* Fechar */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 18,
            background: "none",
            border: "none",
            color: "#38a1ff",
            fontSize: 30,
            cursor: "pointer",
            fontWeight: 700
          }}
          aria-label="Fechar"
        >×</button>
        <h2 style={{
          color: "#1898ff",
          marginBottom: 35,
          fontWeight: 900,
          fontSize: 24,
          letterSpacing: 0.2,
          textAlign: "center",
          fontFamily: "inherit"
        }}>
          Como você deseja cadastrar?
        </h2>
        {/* Opções lado a lado */}
        <div style={{
          display: "flex",
          flexDirection: "row",
          gap: 36,
          width: "100%",
          justifyContent: "center",
          marginBottom: 5,
          flexWrap: "wrap"
        }}>
          {/* Cadastro automático */}
          <div style={{
            background: "#f7fbfe",
            borderRadius: 18,
            boxShadow: "0 2px 18px #e3eefa1b",
            padding: "28px 26px 26px 26px",
            minWidth: 220,
            maxWidth: 260,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            {/* Ícone código de barras */}
            <div style={{
              fontSize: 44,
              marginBottom: 13,
              color: "#1898ff"
            }}>
              {/* SVG código de barras estilizado */}
              <svg width="50" height="36" viewBox="0 0 70 40" fill="none">
                <rect x="2" y="2" width="66" height="30" rx="7" fill="#fff" />
                <rect x="8" y="7" width="2" height="20" fill="#1898ff" />
                <rect x="13" y="7" width="3" height="20" fill="#1898ff" />
                <rect x="18" y="7" width="2" height="20" fill="#1898ff" />
                <rect x="22" y="7" width="1" height="20" fill="#1898ff" />
                <rect x="26" y="7" width="3" height="20" fill="#1898ff" />
                <rect x="32" y="7" width="1" height="20" fill="#1898ff" />
                <rect x="36" y="7" width="2" height="20" fill="#1898ff" />
                <rect x="40" y="7" width="1" height="20" fill="#1898ff" />
                <rect x="44" y="7" width="3" height="20" fill="#1898ff" />
                <rect x="50" y="7" width="2" height="20" fill="#1898ff" />
                <rect x="54" y="7" width="1" height="20" fill="#1898ff" />
                <rect x="58" y="7" width="3" height="20" fill="#1898ff" />
              </svg>
            </div>
            <div style={{ fontWeight: 900, fontSize: 18, color: "#1898ff", marginBottom: 8 }}>
              Cadastro automático
            </div>
            <div style={{
              color: "#2e4066",
              fontSize: 14.7,
              fontWeight: 500,
              textAlign: "center",
              marginBottom: 16
            }}>
              Utilize o código de barras do fabricante para preencher automaticamente as principais informações do produto.
            </div>
            <button
              style={{
                width: "100%",
                background: "linear-gradient(90deg,#20bbff 0%,#1898ff 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 13,
                padding: "13px 0",
                fontWeight: 900,
                fontSize: 15.7,
                cursor: "pointer",
                boxShadow: "0 2px 10px #2196f33a",
                letterSpacing: ".5px",
                marginTop: 2,
                marginBottom: 2
              }}
              onClick={onAuto}
            >ENCONTRAR PRODUTO</button>
          </div>
          {/* Cadastro manual */}
          <div style={{
            background: "#f7fbfe",
            borderRadius: 18,
            boxShadow: "0 2px 18px #e3eefa1b",
            padding: "28px 26px 26px 26px",
            minWidth: 220,
            maxWidth: 260,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            <div style={{
              fontSize: 44,
              marginBottom: 13,
              color: "#20bbff"
            }}>
              <FiFileText size={44} />
            </div>
            <div style={{ fontWeight: 900, fontSize: 18, color: "#1898ff", marginBottom: 8 }}>
              Cadastro manual
            </div>
            <div style={{
              color: "#2e4066",
              fontSize: 14.7,
              fontWeight: 500,
              textAlign: "center",
              marginBottom: 16
            }}>
              Não possui código de barras? <br />
              Preencha os dados manualmente no formulário personalizado.
            </div>
            <button
              style={{
                width: "100%",
                background: "linear-gradient(90deg,#20bbff 0%,#1898ff 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 13,
                padding: "13px 0",
                fontWeight: 900,
                fontSize: 15.7,
                cursor: "pointer",
                boxShadow: "0 2px 10px #2196f33a",
                letterSpacing: ".5px",
                marginTop: 2,
                marginBottom: 2
              }}
              onClick={onManual}
            >INSERIR DADOS</button>
          </div>
        </div>
      </div>
    </div>
  );
}
