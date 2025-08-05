import React, { useState } from "react";

// Função para aplicar máscara de CPF ou CNPJ automaticamente
function formatarCpfCnpj(valor) {
  valor = valor.replace(/\D/g, "");
  if (valor.length <= 11) {
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  } else {
    valor = valor.replace(/^(\d{2})(\d)/, "$1.$2");
    valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    valor = valor.replace(/\.(\d{3})(\d)/, ".$1/$2");
    valor = valor.replace(/(\d{4})(\d)/, "$1-$2");
  }
  return valor;
}

// Máscara de telefone (fixo ou celular BR)
function formatarTelefone(valor) {
  valor = valor.replace(/\D/g, "");
  if (valor.length > 11) valor = valor.slice(0, 11);
  if (valor.length > 10) {
    valor = valor.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
  } else if (valor.length > 5) {
    valor = valor.replace(/^(\d{2})(\d{4,5})(\d{0,4}).*/, "($1) $2-$3");
  } else if (valor.length > 2) {
    valor = valor.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
  } else {
    valor = valor.replace(/^(\d{0,2})/, "($1");
  }
  return valor.trim();
}

export default function ModalCadastroFornecedor({
  onSave, onClose, dadosIniciais = {}, editando
}) {
  const [razaoSocial, setRazaoSocial] = useState(dadosIniciais.razaoSocial || "");
  const [cnpjCpf, setCnpjCpf] = useState(dadosIniciais.cnpjCpf || "");
  const [nomeVendedor, setNomeVendedor] = useState(dadosIniciais.nomeVendedor || "");
  const [telefone, setTelefone] = useState(dadosIniciais.telefone || "");
  const [email, setEmail] = useState(dadosIniciais.email || "");
  const [endereco, setEndereco] = useState(dadosIniciais.endereco || "");
  const [observacoes, setObservacoes] = useState(dadosIniciais.observacoes || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!razaoSocial.trim() || !cnpjCpf.trim() || !telefone.trim()) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    setLoading(true);
    await onSave({
      razaoSocial, cnpjCpf, nomeVendedor, telefone, email, endereco, observacoes,
    });
    setLoading(false);
    onClose();
  }

  // ===== NOVOS ESTILOS =====
  const modalForm = {
    background: "#fff",
    padding: "36px 36px 16px 36px",
    borderRadius: 22,
    boxShadow: "0 8px 38px 0 #00cfff18",
    maxWidth: 540,
    minWidth: 260,
    fontFamily: "inherit"
  };
  const modalHeader = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  };
  const modalTitle = {
    fontSize: "1.65rem",
    fontWeight: 900,
    color: "#32a6ff",
    letterSpacing: "0.04em",
    margin: 0,
    textAlign: "left",
  };
  const modalClose = {
    background: "none",
    border: "none",
    fontSize: "2.1rem",
    color: "#a0b4d7",
    cursor: "pointer",
    lineHeight: 1,
    fontWeight: 500,
    opacity: 0.80,
    transition: "color 0.18s, opacity 0.14s",
  };
  const row = { display: "flex", gap: 16, marginBottom: 0 };
  const col = { flex: 1, display: "flex", flexDirection: "column" };
  const formLabel = {
    display: "block",
    fontSize: "1.03rem",
    fontWeight: 700,
    color: "#2196f3",
    marginBottom: 4,
    marginTop: 9,
    letterSpacing: "0.01em",
  };
  const formLabelRequired = {
    color: "#ff1744",
    marginLeft: 3,
    fontSize: "1em",
    fontWeight: 800,
  };
  const formInput = {
    width: "100%",
    boxSizing: "border-box",
    borderRadius: 10,
    border: "1.7px solid #e1e9f7",
    background: "#f8fafc",
    color: "#23244b",
    fontSize: "1.05rem",
    padding: "13px 16px",
    outline: "none",
    fontWeight: 600,
    transition: "border-color 0.16s, box-shadow 0.16s",
    marginBottom: 2,
    fontFamily: "inherit",
    boxShadow: "0 2px 9px #eaf4ff15 inset",
  };
  const formTextarea = {
    ...formInput,
    minHeight: 54,
    resize: "vertical",
  };
  const modalActions = {
    display: "flex",
    gap: 14,
    marginTop: 30,
    justifyContent: "flex-end",
  };
  const btnPrimary = {
    background: "linear-gradient(90deg, #00cfff 0%, #237be7 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "14px 38px",
    fontWeight: 900,
    fontSize: "1.13rem",
    cursor: "pointer",
    letterSpacing: ".3px",
    boxShadow: "0 2px 14px #00cfff1a",
    transition: "background 0.18s, box-shadow 0.17s",
  };
  const btnPrimaryHover = {
    background: "linear-gradient(90deg, #237be7 0%, #00cfff 100%)"
  }
  const btnOutline = {
    background: "#fff",
    color: "#2196f3",
    border: "2px solid #2196f3",
    borderRadius: 12,
    padding: "14px 38px",
    fontWeight: 900,
    fontSize: "1.13rem",
    cursor: "pointer",
    letterSpacing: ".2px",
    transition: "background 0.18s, color 0.18s, border 0.18s",
    marginLeft: 4,
  };

  // Hover states (gambiarra pois é inline)
  const [hoverSalvar, setHoverSalvar] = useState(false);
  const [hoverCancelar, setHoverCancelar] = useState(false);

  return (
    <form onSubmit={handleSubmit} style={modalForm}>
      <div style={modalHeader}>
        <h3 style={modalTitle}>
          {editando ? "Editar Fornecedor" : "Cadastrar Fornecedor"}
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          style={modalClose}
          onMouseOver={e => e.currentTarget.style.color = "#2196f3"}
          onMouseOut={e => e.currentTarget.style.color = "#a0b4d7"}
        >×</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={row}>
          <div style={col}>
            <label htmlFor="razaoSocial" style={formLabel}>
              Razão social <span style={formLabelRequired}>*</span>
            </label>
            <input
              id="razaoSocial"
              type="text"
              value={razaoSocial}
              onChange={e => setRazaoSocial(e.target.value)}
              required
              placeholder="Digite a razão social"
              style={formInput}
              autoFocus
            />
          </div>
          <div style={col}>
            <label htmlFor="cnpjCpf" style={formLabel}>
              CNPJ ou CPF <span style={formLabelRequired}>*</span>
            </label>
            <input
              id="cnpjCpf"
              type="text"
              value={cnpjCpf}
              onChange={e => setCnpjCpf(formatarCpfCnpj(e.target.value))}
              required
              placeholder="Digite o CNPJ ou CPF"
              style={formInput}
              maxLength={18}
              inputMode="numeric"
            />
          </div>
        </div>
        <div style={row}>
          <div style={col}>
            <label htmlFor="nomeVendedor" style={formLabel}>
              Nome do vendedor
            </label>
            <input
              id="nomeVendedor"
              type="text"
              value={nomeVendedor}
              onChange={e => setNomeVendedor(e.target.value)}
              placeholder="Digite o nome do vendedor"
              style={formInput}
            />
          </div>
          <div style={col}>
            <label htmlFor="telefone" style={formLabel}>
              Telefone <span style={formLabelRequired}>*</span>
            </label>
            <input
              id="telefone"
              type="tel"
              value={telefone}
              onChange={e => setTelefone(formatarTelefone(e.target.value))}
              required
              placeholder="(00) 00000-0000"
              style={formInput}
              maxLength={15}
              inputMode="numeric"
            />
          </div>
        </div>
        <div style={row}>
          <div style={col}>
            <label htmlFor="email" style={formLabel}>
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Digite o e-mail"
              style={formInput}
            />
          </div>
          <div style={col}>
            <label htmlFor="endereco" style={formLabel}>
              Endereço
            </label>
            <input
              id="endereco"
              type="text"
              value={endereco}
              onChange={e => setEndereco(e.target.value)}
              placeholder="Digite o endereço"
              style={formInput}
            />
          </div>
        </div>
        <div>
          <label htmlFor="observacoes" style={formLabel}>
            Observações
          </label>
          <textarea
            id="observacoes"
            value={observacoes}
            onChange={e => setObservacoes(e.target.value)}
            placeholder="Observações extras"
            style={formTextarea}
            rows={3}
          />
        </div>
      </div>
      <div style={modalActions}>
        <button
          type="submit"
          style={{
            ...btnPrimary,
            ...(hoverSalvar ? btnPrimaryHover : {})
          }}
          disabled={loading}
          onMouseOver={() => setHoverSalvar(true)}
          onMouseOut={() => setHoverSalvar(false)}
        >
          {loading ? "Salvando..." : (editando ? "Salvar edição" : "Salvar fornecedor")}
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            ...btnOutline,
            background: hoverCancelar ? "#f8fafc" : "#fff",
            color: hoverCancelar ? "#237be7" : "#2196f3",
            borderColor: hoverCancelar ? "#237be7" : "#2196f3"
          }}
          onMouseOver={() => setHoverCancelar(true)}
          onMouseOut={() => setHoverCancelar(false)}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
