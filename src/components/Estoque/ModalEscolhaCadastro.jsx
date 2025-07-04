import React from "react";
import { FiFileText } from "react-icons/fi";
import "./Cadastro.css";

export default function ModalEscolhaCadastro({ open, onClose, onManual, onAuto }) {
  if (!open) return null;

  return (
    <div className="modal-escolha-cadastro-bg">
      <div className="modal-escolha-cadastro">
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
        <div className="modal-cadastro-cols">
          {/* COLUNA AUTOMÁTICO */}
          <div className="modal-cadastro-col">
            <div className="modal-cadastro-icon">
              {/* Ícone de código de barras */}
              <svg width="50" height="34" viewBox="0 0 70 40" fill="none">
                <rect x="2" y="2" width="66" height="30" rx="7" fill="#fff" />
                <rect x="8" y="7" width="2" height="20" fill="#231b39" />
                <rect x="13" y="7" width="3" height="20" fill="#231b39" />
                <rect x="18" y="7" width="2" height="20" fill="#231b39" />
                <rect x="22" y="7" width="1" height="20" fill="#231b39" />
                <rect x="26" y="7" width="3" height="20" fill="#231b39" />
                <rect x="32" y="7" width="1" height="20" fill="#231b39" />
                <rect x="36" y="7" width="2" height="20" fill="#231b39" />
                <rect x="40" y="7" width="1" height="20" fill="#231b39" />
                <rect x="44" y="7" width="3" height="20" fill="#231b39" />
                <rect x="50" y="7" width="2" height="20" fill="#231b39" />
                <rect x="54" y="7" width="1" height="20" fill="#231b39" />
                <rect x="58" y="7" width="3" height="20" fill="#231b39" />
              </svg>
            </div>
            <div className="modal-cadastro-title amarelo">Cadastro automático</div>
            <div className="modal-cadastro-desc">
              Utilize o código de barras do fabricante para preencher automaticamente as principais informações do produto.
            </div>
            <button className="btn-auto" onClick={onAuto}>ENCONTRAR PRODUTO</button>
          </div>

          {/* COLUNA MANUAL */}
          <div className="modal-cadastro-col">
            <div className="modal-cadastro-icon">
              <FiFileText size={48} color="#22d3ee" />
            </div>
            <div className="modal-cadastro-title amarelo">Cadastro manual</div>
            <div className="modal-cadastro-desc">
              Não possui código de barras?<br />
              Preencha os dados manualmente no formulário personalizado.
            </div>
            <button className="btn-manual" onClick={onManual}>INSERIR DADOS</button>
          </div>
        </div>
      </div>
    </div>
  );
}
