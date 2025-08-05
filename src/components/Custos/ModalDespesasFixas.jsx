import React, { useRef, useEffect } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import "./ModalDespesasFixas.css";

export default function ModalDespesasFixas({
  open,
  onClose,
  despesa,
  onChange,
  onSave,
  editar = false
}) {
  const nomeRef = useRef(null);

  useEffect(() => {
    if (open && nomeRef.current) {
      nomeRef.current.focus();
    }
  }, [open]);

  // Validação: só habilita salvar se os campos estão preenchidos
  const podeSalvar =
    despesa.nome &&
    despesa.nome.trim() !== "" &&
    despesa.valor &&
    despesa.valor !== "0,00";

  if (!open) return null;

  return (
    <div className="painel-modal-backdrop">
      <div className="painel-modal-centralizado">
        <button
          type="button"
          className="painel-modal-close-btn"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 className="painel-modal-titulo">
          {editar ? "Editar Custo" : "Adicionar Custo"}
        </h2>
        <div className="painel-modal-form">
          <input
            ref={nomeRef}
            value={despesa.nome}
            onChange={e => onChange({ ...despesa, nome: e.target.value })}
            placeholder="Nome do custo"
            className="painel-modal-input"
            maxLength={60}
            autoFocus
          />
          <div className="painel-modal-valorgroup">
            <span className="painel-modal-cifrao">R$</span>
            <input
              value={despesa.valor}
              type="text"
              inputMode="numeric"
              onChange={e => {
                let value = e.target.value.replace(/[^\d]/g, "");
                if (!value) return onChange({ ...despesa, valor: "" });
                if (value.length > 9) value = value.slice(0, 9);
                let number = parseFloat(value) / 100;
                let formatted = number.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
                onChange({ ...despesa, valor: formatted });
              }}
              placeholder="Valor"
              className="painel-modal-input painel-modal-input-valor"
              maxLength={15}
              autoComplete="off"
              style={{ paddingLeft: 56 }} // Mais espaço! 
            />
          </div>
          <div className="painel-modal-btns">
            <button
              className="btn-azul-grad"
              onClick={() => {
                if (podeSalvar) onSave(despesa);
              }}
              type="button"
              disabled={!podeSalvar}
              style={{
                opacity: podeSalvar ? 1 : 0.5,
                cursor: podeSalvar ? "pointer" : "not-allowed",
              }}
            >
              <FiCheck size={21} /> Salvar
            </button>
            <button
              className="btn-cinza"
              onClick={onClose}
              type="button"
            >
              <FiX size={21} /> Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}