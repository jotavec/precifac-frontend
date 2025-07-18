import React, { useState } from "react";

// Função para aplicar máscara de CPF ou CNPJ automaticamente
function formatarCpfCnpj(valor) {
  valor = valor.replace(/\D/g, "");
  if (valor.length <= 11) {
    // CPF: 000.000.000-00
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  } else {
    // CNPJ: 00.000.000/0000-00
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
    // (99) 99999-9999
    valor = valor.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
  } else if (valor.length > 5) {
    // (99) 9999-9999
    valor = valor.replace(/^(\d{2})(\d{4,5})(\d{0,4}).*/, "($1) $2-$3");
  } else if (valor.length > 2) {
    valor = valor.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
  } else {
    valor = valor.replace(/^(\d{0,2})/, "($1");
  }
  return valor.trim();
}

// ==== FORMULÁRIO DE FORNECEDOR (CRUD) ====
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

  // --- ESTILOS INLINE DO FORM ---
  const modalForm = {
    padding: "30px 28px 12px 28px",
    borderRadius: 22,
    background: "none",
    maxWidth: 560,
    minWidth: 240,
  };
  const modalHeader = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  };
  const modalTitle = {
    fontSize: "1.38rem",
    fontWeight: 800,
    color: "#ffe066",
    letterSpacing: "0.02em",
    margin: 0,
  };
  const modalClose = {
    background: "none",
    border: "none",
    fontSize: "2.1rem",
    color: "#a09eec",
    cursor: "pointer",
    lineHeight: 1,
    fontWeight: 500,
    opacity: 0.76,
    transition: "color 0.18s, opacity 0.14s",
  };
  const row = { display: "flex", gap: 16, marginBottom: 0 };
  const col = { flex: 1 };
  const formLabel = {
    display: "block",
    fontSize: "1.01rem",
    fontWeight: 600,
    color: "#a09eec",
    marginBottom: 4,
    marginTop: 7,
    letterSpacing: "0.01em",
  };
  const formLabelRequired = {
    color: "#ffe066",
    marginLeft: 2,
    fontSize: "1em",
  };
  const formInput = {
    width: "100%",
    boxSizing: "border-box",
    borderRadius: 9,
    border: "1.5px solid #7c3aed99",
    background: "rgba(40, 31, 61, 0.95)",
    color: "#ffe066",
    fontSize: "1.04rem",
    padding: "10px 14px",
    outline: "none",
    fontWeight: 500,
    transition: "border-color 0.18s, box-shadow 0.18s",
    marginBottom: 2,
    fontFamily: "inherit",
  };
  const formTextarea = {
    ...formInput,
    minHeight: 52,
    resize: "vertical",
  };
  const modalActions = {
    display: "flex",
    gap: 14,
    marginTop: 20,
    justifyContent: "flex-end",
  };
  const btnPrimary = {
    background: "linear-gradient(90deg, #7c3aed 60%, #ffe066 130%)",
    color: "#fff",
    border: "none",
    borderRadius: 11,
    padding: "12px 28px",
    fontWeight: 800,
    fontSize: "1.08rem",
    cursor: "pointer",
    letterSpacing: ".2px",
    boxShadow: "0 2px 9px #7c3aed33",
    transition: "filter .18s",
  };
  const btnOutline = {
    background: "#25184b",
    color: "#ffe066",
    border: "1.5px solid #7c3aed99",
    borderRadius: 11,
    padding: "12px 28px",
    fontWeight: 800,
    fontSize: "1.08rem",
    cursor: "pointer",
    letterSpacing: ".2px",
    transition: "filter .18s",
  };

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
          onMouseOver={e => e.currentTarget.style.color = "#ff4d8b"}
          onMouseOut={e => e.currentTarget.style.color = "#a09eec"}
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
        <button type="submit" style={btnPrimary} disabled={loading}>
          {loading ? "Salvando..." : (editando ? "Salvar edição" : "Salvar fornecedor")}
        </button>
        <button type="button" onClick={onClose} style={btnOutline}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
