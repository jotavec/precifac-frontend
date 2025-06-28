import React from "react";
import "./ModalCadastro.css"; // importa o css exclusivo

export default function ModalCadastro({ open, onClose, ingrediente, onSave, onDelete, onChange }) {
  if (!open) return null;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    onChange({
      ...ingrediente,
      [name]: type === "checkbox" ? checked : value
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(ingrediente);
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-cadastro">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-title">
          {ingrediente.codigo ? "Editar Cadastro" : "Novo Cadastro"}
        </h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-row">
            <div>
              <label>Código</label>
              <input name="codigo" value={ingrediente.codigo} onChange={handleChange} required />
            </div>
            <div>
              <label>Nome</label>
              <input name="nome" value={ingrediente.nome} onChange={handleChange} required />
            </div>
          </div>
          <div className="modal-row">
            <div>
              <label>Categoria</label>
              <input name="categoria" value={ingrediente.categoria} onChange={handleChange} required />
            </div>
            <div>
              <label>Marca</label>
              <input name="marca" value={ingrediente.marca} onChange={handleChange} />
            </div>
          </div>
          <div className="modal-row">
            <div>
              <label>Unidade</label>
              <input name="unidade" value={ingrediente.unidade} onChange={handleChange} required />
            </div>
            <div>
              <label>Estoque</label>
              <input name="estoque" value={ingrediente.estoque} onChange={handleChange} />
            </div>
            <div>
              <label>Custo (R$)</label>
              <input name="custo" value={ingrediente.custo} onChange={handleChange} />
            </div>
          </div>
          <div className="modal-row">
            <label className="modal-switch">
              <input
                type="checkbox"
                name="ativo"
                checked={ingrediente.ativo}
                onChange={handleChange}
              />
              <span className="modal-slider"></span>
              Ativo
            </label>
          </div>
          <div className="modal-actions">
            {ingrediente.codigo && (
              <button
                type="button"
                className="modal-btn modal-btn-delete"
                onClick={onDelete}
              >
                Excluir
              </button>
            )}
            <button type="submit" className="modal-btn modal-btn-save">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
