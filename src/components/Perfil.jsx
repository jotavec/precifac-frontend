import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000";

// --- ESTILOS --- //
const perfilCard = {
  maxWidth: 420,
  width: "100%",
  marginTop: 32,    // só espaço em cima
  marginLeft: 0,    // cola na esquerda do main-content
  background: "#19172c",
  border: "1.5px solid #28244a",
  borderRadius: 12,
  boxShadow: "0 6px 30px #00000022",
  color: "#fff",
  padding: 0,
  overflow: "hidden"
};

const innerBlock = {
  background: "#18162a",
  borderRadius: 10,
  padding: 28,
  margin: 28,
  boxSizing: "border-box"
};

const sectionTitle = {
  fontWeight: 700,
  fontSize: 16,
  color: "#fff",
  marginTop: 20,
  marginBottom: 10,
  letterSpacing: 0.10,
  borderBottom: "1px solid #28244a",
  paddingBottom: 4
};

const labelStyle = {
  fontWeight: 700,
  color: "#ffe060",
  fontSize: 13.5,
  marginBottom: 2,
  marginTop: 12,
  display: "block"
};

const inputStyle = {
  width: "100%",
  background: "#23213a",
  color: "#fff",
  border: "1px solid #2d2643",
  borderRadius: 7,
  fontSize: 14,
  padding: "7px 12px",
  fontWeight: 500,
  outline: "none",
  margin: 0,
  marginBottom: 6,
  transition: "border-color 0.2s"
};

const disabledInput = {
  ...inputStyle,
  background: "#181824",
  color: "#aaa",
  cursor: "not-allowed"
};

const btnMain = {
  background: "#8c52ff",
  color: "#fff",
  border: "none",
  borderRadius: 7,
  padding: "10px 0",
  width: 110,
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
  marginRight: 8,
  marginTop: 18,
  boxShadow: "0 2px 8px #00000014",
  transition: "background 0.18s, filter 0.18s"
};

const btnSec = {
  background: "#23213a",
  color: "#ffe060",
  border: "none",
  borderRadius: 7,
  padding: "10px 0",
  width: 110,
  fontWeight: 600,
  fontSize: 15,
  marginTop: 18,
  cursor: "pointer",
  transition: "background 0.18s, color 0.18s, filter 0.18s"
};

// --- CEP FIELD: Botão independente, input arredondado dos dois lados --- //
const blocoCep = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 0
};

const inputCepStyle = {
  background: "#23213a",
  color: "#fff",
  border: "1px solid #2d2643",
  borderRadius: "7px",
  fontSize: 14,
  padding: "0 12px",
  fontWeight: 500,
  outline: "none",
  height: 40,
  width: "100%",
  margin: 0,
  boxSizing: "border-box",
  display: "block",
  transition: "border-color 0.2s"
};

const inputCepDisabled = {
  ...inputCepStyle,
  background: "#181824",
  color: "#aaa",
  cursor: "not-allowed"
};

const btnCep = {
  background: "#28244a",
  color: "#fff",
  border: "none",
  borderRadius: "7px",
  fontWeight: 800,
  fontSize: 14,
  height: 40,
  minWidth: 100,
  padding: "0 18px",
  boxShadow: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.18s, filter 0.18s",
  cursor: "pointer"
};

const btnCepDisabled = {
  ...btnCep,
  background: "#23213a",
  color: "#bbb",
  cursor: "not-allowed"
};

// --- NÚMERO + SEM NÚMERO: botão independente do lado direito --- //
const blocoNumero = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 0,
};

const inputNumeroStyle = {
  background: "#23213a",
  color: "#fff",
  border: "1px solid #2d2643",
  borderRadius: "7px",
  fontSize: 14,
  padding: "0 12px",
  fontWeight: 500,
  outline: "none",
  height: 40,
  width: "100%",
  margin: 0,
  boxSizing: "border-box",
  display: "block"
};

const inputNumeroDisabled = {
  ...inputNumeroStyle,
  background: "#181824",
  color: "#aaa",
  cursor: "not-allowed"
};

// Botão "Sem número" independente
const btnSemNumero = {
  background: "#28244a",
  color: "#ffe060",
  border: "none",
  borderRadius: "7px",
  fontWeight: 600,
  fontSize: 14,
  height: 40,
  minWidth: 110,
  padding: "0 18px",
  boxShadow: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "background 0.18s, color 0.18s, filter 0.18s",
  gap: 7,
  userSelect: "none"
};

const btnSemNumeroDisabled = {
  ...btnSemNumero,
  background: "#23213a",
  color: "#aaa",
  cursor: "not-allowed"
};

// --- MÁSCARAS PARA TODOS OS CAMPOS --- //
function formatCNPJ(value) {
  value = value.replace(/\D/g, '');
  if (value.length > 14) value = value.slice(0, 14);
  value = value.replace(/^(\d{2})(\d)/, '$1.$2');
  value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
  value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
  value = value.replace(/(\d{4})(\d)/, '$1-$2');
  return value;
}

function formatCPF(value) {
  value = value.replace(/\D/g, '');
  if (value.length > 11) value = value.slice(0, 11);
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return value;
}

function formatPhone(value) {
  value = value.replace(/\D/g, '');
  if (value.length > 11) value = value.slice(0, 11);
  value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
  if (value.length > 10) {
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
  } else {
    value = value.replace(/(\d{4})(\d)/, '$1-$2');
  }
  return value;
}

function formatCEP(value) {
  value = value.replace(/\D/g, '');
  if (value.length > 8) value = value.slice(0, 8);
  value = value.replace(/(\d{5})(\d)/, '$1-$2');
  return value;
}

export default function Perfil({ user = {} }) {
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nome: user.name || "",
    email: user.email || "",
    telefone: user.telefone || "",
    empresaNome: "",
    cnpj: "",
    telefoneEmpresa: "",
    cep: "",
    rua: "",
    numero: "",
    semNumero: false,
    bairro: "",
    cidade: "",
    estado: "",
    cpf: ""
  });

  useEffect(() => {
    async function carregarEmpresa() {
      if (!user?.id) return;
      try {
        const res = await axios.get(`${API_URL}/company-config`, {
          params: { userId: user.id }
        });
        if (res.data) {
          setForm(f => ({
            ...f,
            empresaNome: res.data.companyName || "",
            cnpj: res.data.cnpj || "",
            telefoneEmpresa: res.data.phone || "",
            cep: res.data.cep || "",
            rua: res.data.rua || "",
            numero: res.data.numero || "",
            bairro: res.data.bairro || "",
            cidade: res.data.cidade || "",
            estado: res.data.estado || "",
            semNumero: res.data.numero === "",
            cpf: res.data.cpf || ""
          }));
        }
      } catch {
        // Sem dados, ignora
      }
    }
    carregarEmpresa();
    // eslint-disable-next-line
  }, [user]);

  async function buscarCep() {
    if (!form.cep || form.cep.length < 8) return;
    setForm(f => ({ ...f, rua: "Buscando...", bairro: "", cidade: "", estado: "" }));
    try {
      const { data } = await axios.get(`https://viacep.com.br/ws/${form.cep.replace(/\D/g, "")}/json/`);
      setForm(f => ({
        ...f,
        rua: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
      }));
    } catch {
      setForm(f => ({ ...f, rua: "", bairro: "", cidade: "", estado: "" }));
      alert("CEP não encontrado!");
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    let val = value;
    // Máscaras automáticas em TODOS os campos relevantes
    if (name === "cnpj") val = formatCNPJ(value);
    if (name === "cpf") val = formatCPF(value);
    if (name === "cep") val = formatCEP(value);
    if (name === "telefoneEmpresa" || name === "telefone") val = formatPhone(value);

    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : val,
      ...(name === "semNumero" && checked ? { numero: "" } : {})
    }));
  }

  function handleSemNumeroClick() {
    if (!editando) return;
    setForm(f => ({
      ...f,
      semNumero: !f.semNumero,
      numero: !f.semNumero ? "" : f.numero
    }));
  }

  async function handleSalvar() {
    setEditando(false);
    try {
      await axios.post(`${API_URL}/company-config`, {
        userId: user.id,
        companyName: form.empresaNome,
        cnpj: form.cnpj,
        phone: form.telefoneEmpresa,
        cep: form.cep,
        rua: form.rua,
        numero: form.semNumero ? "" : form.numero,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.estado,
        cpf: form.cpf
      });
      alert("Configurações salvas!");
    } catch (err) {
      alert("Erro ao salvar configurações");
    }
  }

  function handleCancelar() {
    setEditando(false);
    if (user?.id) {
      axios.get(`${API_URL}/company-config`, { params: { userId: user.id } })
        .then(res => {
          if (res.data) {
            setForm(f => ({
              ...f,
              empresaNome: res.data.companyName || "",
              cnpj: res.data.cnpj || "",
              telefoneEmpresa: res.data.phone || "",
              cep: res.data.cep || "",
              rua: res.data.rua || "",
              numero: res.data.numero || "",
              bairro: res.data.bairro || "",
              cidade: res.data.cidade || "",
              estado: res.data.estado || "",
              semNumero: res.data.numero === "",
              cpf: res.data.cpf || ""
            }));
          }
        });
    }
  }

  // Hover states
  const [mainHover, setMainHover] = useState(false);
  const [secHover, setSecHover] = useState(false);
  const [cepHover, setCepHover] = useState(false);
  const [semNumeroHover, setSemNumeroHover] = useState(false);

  return (
    <div style={perfilCard}>
      <div style={innerBlock}>
        <h2 style={{
          color: "#ffe060",
          fontWeight: 900,
          fontSize: 22,
          marginBottom: 2,
          letterSpacing: 0.35
        }}>
          Perfil
        </h2>
        <div style={sectionTitle}>Seus Dados</div>
        <label style={labelStyle}>Nome</label>
        <input
          disabled
          name="nome"
          placeholder="Seu nome"
          value={form.nome}
          style={disabledInput}
        />
        <label style={labelStyle}>E-mail</label>
        <input
          disabled
          name="email"
          placeholder="E-mail"
          value={form.email}
          style={disabledInput}
        />
        <label style={labelStyle}>CPF</label>
        <input
          disabled={!editando}
          name="cpf"
          placeholder="CPF"
          value={form.cpf}
          onChange={handleChange}
          style={editando ? inputStyle : disabledInput}
          maxLength={14}
        />
        <label style={labelStyle}>Telefone</label>
        <input
          disabled={!editando}
          name="telefone"
          placeholder="Telefone"
          value={form.telefone}
          onChange={handleChange}
          style={editando ? inputStyle : disabledInput}
          maxLength={15}
        />

        <div style={sectionTitle}>Dados da Empresa</div>
        <label style={labelStyle}>Nome da empresa</label>
        <input
          disabled={!editando}
          name="empresaNome"
          placeholder="Nome da empresa"
          value={form.empresaNome}
          onChange={handleChange}
          style={editando ? inputStyle : disabledInput}
        />
        <label style={labelStyle}>CNPJ</label>
        <input
          disabled={!editando}
          name="cnpj"
          placeholder="CNPJ"
          value={form.cnpj}
          onChange={handleChange}
          style={editando ? inputStyle : disabledInput}
          maxLength={18}
        />
        <label style={labelStyle}>Telefone da empresa</label>
        <input
          disabled={!editando}
          name="telefoneEmpresa"
          placeholder="Telefone da empresa"
          value={form.telefoneEmpresa}
          onChange={handleChange}
          style={editando ? inputStyle : disabledInput}
          maxLength={15}
        />

        <div style={sectionTitle}>Endereço da Empresa</div>
        <label style={labelStyle}>CEP</label>
        <div style={blocoCep}>
          <input
            disabled={!editando}
            name="cep"
            placeholder="CEP"
            value={form.cep}
            onChange={handleChange}
            maxLength={9}
            style={editando ? inputCepStyle : inputCepDisabled}
          />
          <button
            type="button"
            disabled={!editando}
            onClick={buscarCep}
            style={
              editando
                ? (cepHover ? { ...btnCep, background: "#6d3be6" } : btnCep)
                : btnCepDisabled
            }
            onMouseEnter={() => setCepHover(true)}
            onMouseLeave={() => setCepHover(false)}
          >
            Buscar CEP
          </button>
        </div>
        <label style={labelStyle}>Rua</label>
        <input
          disabled={!editando}
          name="rua"
          placeholder="Rua"
          value={form.rua}
          onChange={handleChange}
          style={editando ? inputStyle : disabledInput}
        />

        <label style={labelStyle}>Número</label>
        <div style={blocoNumero}>
          <input
            disabled={!editando || form.semNumero}
            name="numero"
            placeholder="Número"
            value={form.numero}
            onChange={handleChange}
            style={!editando || form.semNumero ? inputNumeroDisabled : inputNumeroStyle}
          />
          <button
            type="button"
            onClick={handleSemNumeroClick}
            disabled={!editando}
            style={
              !editando
                ? btnSemNumeroDisabled
                : semNumeroHover || form.semNumero
                  ? { ...btnSemNumero, background: "#ffe060", color: "#23213a" }
                  : btnSemNumero
            }
            onMouseEnter={() => setSemNumeroHover(true)}
            onMouseLeave={() => setSemNumeroHover(false)}
            aria-pressed={form.semNumero}
          >
            <input
              type="checkbox"
              checked={form.semNumero}
              readOnly
              tabIndex={-1}
              style={{
                marginRight: 7,
                accentColor: "#8c52ff",
                width: 16,
                height: 16,
                verticalAlign: "middle",
                pointerEvents: "none"
              }}
            />
            Sem número
          </button>
        </div>

        <label style={labelStyle}>Bairro</label>
        <input
          disabled={!editando}
          name="bairro"
          placeholder="Bairro"
          value={form.bairro}
          onChange={handleChange}
          style={editando ? inputStyle : disabledInput}
        />
        <label style={labelStyle}>Cidade</label>
        <input
          disabled={!editando}
          name="cidade"
          placeholder="Cidade"
          value={form.cidade}
          onChange={handleChange}
          style={editando ? inputStyle : disabledInput}
        />
        <label style={labelStyle}>Estado</label>
        <input
          disabled={!editando}
          name="estado"
          placeholder="Estado"
          value={form.estado}
          onChange={handleChange}
          style={editando ? inputStyle : disabledInput}
        />

        <div style={{ marginTop: 16, display: "flex", gap: 7 }}>
          {editando ? (
            <>
              <button
                onClick={handleSalvar}
                style={mainHover ? { ...btnMain, background: "#6d3be6" } : btnMain}
                onMouseEnter={() => setMainHover(true)}
                onMouseLeave={() => setMainHover(false)}
              >Salvar</button>
              <button
                onClick={handleCancelar}
                style={secHover ? { ...btnSec, background: "#ffe060", color: "#23213a" } : btnSec}
                onMouseEnter={() => setSecHover(true)}
                onMouseLeave={() => setSecHover(false)}
              >Cancelar</button>
            </>
          ) : (
            <button
              onClick={() => setEditando(true)}
              style={mainHover ? { ...btnMain, background: "#6d3be6" } : btnMain}
              onMouseEnter={() => setMainHover(true)}
              onMouseLeave={() => setMainHover(false)}
            >Editar</button>
          )}
        </div>
        <div style={{ height: 12 }} />
      </div>
    </div>
  );
}
