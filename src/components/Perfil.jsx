import { useState, useEffect } from "react";
import axios from "axios";
import ModalToast from "./modals/ModalToast";
import './Perfil.css';

const API_URL = "/api";

// Máscaras
function formatCNPJ(value) { value = value.replace(/\D/g, ''); if (value.length > 14) value = value.slice(0, 14); value = value.replace(/^(\d{2})(\d)/, '$1.$2'); value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3'); value = value.replace(/\.(\d{3})(\d)/, '.$1/$2'); value = value.replace(/(\d{4})(\d)/, '$1-$2'); return value; }
function formatCPF(value) { value = value.replace(/\D/g, ''); if (value.length > 11) value = value.slice(0, 11); value = value.replace(/(\d{3})(\d)/, '$1.$2'); value = value.replace(/(\d{3})(\d)/, '$1.$2'); value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); return value; }
function formatPhone(value) { value = value.replace(/\D/g, ''); if (value.length > 11) value = value.slice(0, 11); value = value.replace(/^(\d{2})(\d)/g, '($1) $2'); if (value.length > 10) { value = value.replace(/(\d{5})(\d)/, '$1-$2'); } else { value = value.replace(/(\d{4})(\d)/, '$1-$2'); } return value; }
function formatCEP(value) { value = value.replace(/\D/g, ''); if (value.length > 8) value = value.slice(0, 8); value = value.replace(/(\d{5})(\d)/, '$1-$2'); return value; }

const Avatar = () => (
  <div className="perfil-avatar-branco">
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="60" fill="#ececec" />
      <text x="50%" y="58%" textAnchor="middle" fontSize="52" fill="#bbb" dy=".3em" fontWeight="bold">👤</text>
    </svg>
  </div>
);

export default function Perfil() {
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
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
  const [backup, setBackup] = useState(form);

  // Toast State
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_URL}/users/me`, { withCredentials: true });
        let novoForm = {
          ...form,
          nome: data.name || "",
          email: data.email || "",
          telefone: data.telefone || "",
          cpf: data.cpf || ""
        };

        const resConfig = await axios.get(`${API_URL}/company-config`, { withCredentials: true });
        if (resConfig.data) {
          novoForm = {
            ...novoForm,
            empresaNome: resConfig.data.companyName || "",
            cnpj: resConfig.data.cnpj || "",
            telefoneEmpresa: resConfig.data.phone || "",
            cep: resConfig.data.cep || "",
            rua: resConfig.data.rua || "",
            numero: resConfig.data.numero || "",
            bairro: resConfig.data.bairro || "",
            cidade: resConfig.data.cidade || "",
            estado: resConfig.data.estado || ""
          };
        }
        setForm(novoForm);
        setBackup(novoForm);
      } catch (err) {
        setToastMsg("Erro ao buscar usuário");
        setToastType("error");
        setShowToast(true);
      }
      setLoading(false);
    }
    fetchUser();
    // eslint-disable-next-line
  }, []);

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
      setToastMsg("CEP não encontrado!");
      setToastType("warn");
      setShowToast(true);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    let val = value;
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
    setLoading(true);
    try {
      await axios.put(`${API_URL}/users/me`, {
        name: form.nome,
        email: form.email,
        cpf: form.cpf,
        telefone: form.telefone
      }, { withCredentials: true });

      await axios.post(`${API_URL}/company-config`, {
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
      }, { withCredentials: true });

      setBackup(form);

      setToastMsg("Configurações salvas!");
      setToastType("success");
      setShowToast(true);
    } catch (err) {
      setToastMsg("Erro ao salvar configurações");
      setToastType("error");
      setShowToast(true);
    }
    setLoading(false);
  }

  function handleCancelar() {
    setEditando(false);
    setForm(backup); // Volta ao estado antes da edição
  }

  if (loading) return <div style={{ color: "#333", margin: 24 }}>Carregando...</div>;

  return (
    <div className="perfil-branco-main">
      <ModalToast
        show={showToast}
        message={toastMsg}
        type={toastType}
        onClose={() => setShowToast(false)}
      />

      <div className="perfil-branco-side">
        <Avatar />
        <div className="perfil-branco-nome">{form.nome || "Seu Nome"}</div>
        <div className="perfil-branco-cargo">Usuário</div>
        <button className="perfil-branco-btn-info">Personal Information</button>
        <button className="perfil-branco-btn-outro" disabled>Login & Password</button>
        <button className="perfil-branco-btn-outro" disabled>Log Out</button>
      </div>

      <form
        className="perfil-branco-content"
        autoComplete="off"
        onSubmit={e => { e.preventDefault(); handleSalvar(); }}
      >
        <h2 className="perfil-branco-titulo">Personal Information</h2>
        <div className="perfil-branco-form">
          {/* Nome */}
          <div className="perfil-branco-form-row">
            <div>
              <label>Nome</label>
              <input
                type="text"
                name="nome"
                disabled={!editando}
                value={form.nome}
                onChange={handleChange}
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label>CPF</label>
              <input
                type="text"
                name="cpf"
                disabled={!editando}
                value={form.cpf}
                onChange={handleChange}
                placeholder="CPF"
              />
            </div>
          </div>
          {/* Email e Tel */}
          <div className="perfil-branco-form-row">
            <div style={{ flex: 1 }}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                disabled={!editando}
                value={form.email}
                onChange={handleChange}
                placeholder="E-mail"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Telefone</label>
              <input
                type="text"
                name="telefone"
                disabled={!editando}
                value={form.telefone}
                onChange={handleChange}
                placeholder="Telefone"
              />
            </div>
          </div>
          {/* Empresa / CNPJ */}
          <div className="perfil-branco-form-row">
            <div>
              <label>Empresa</label>
              <input
                type="text"
                name="empresaNome"
                disabled={!editando}
                value={form.empresaNome}
                onChange={handleChange}
                placeholder="Empresa"
              />
            </div>
            <div>
              <label>CNPJ</label>
              <input
                type="text"
                name="cnpj"
                disabled={!editando}
                value={form.cnpj}
                onChange={handleChange}
                placeholder="CNPJ"
              />
            </div>
          </div>
          {/* Endereço */}
          <div className="perfil-branco-form-row">
            <div style={{ flex: 2 }}>
              <label>Endereço</label>
              <input
                type="text"
                name="rua"
                disabled={!editando}
                value={form.rua}
                onChange={handleChange}
                placeholder="Rua"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Número</label>
              <input
                type="text"
                name="numero"
                disabled={!editando || form.semNumero}
                value={form.numero}
                onChange={handleChange}
                placeholder="Nº"
              />
              <label style={{ display: 'inline-block', fontSize: 11 }}>
                <input
                  type="checkbox"
                  checked={form.semNumero}
                  disabled={!editando}
                  onChange={handleSemNumeroClick}
                  style={{ marginRight: 3, marginTop: 4 }}
                />
                Sem número
              </label>
            </div>
          </div>
          <div className="perfil-branco-form-row">
            <div>
              <label>Bairro</label>
              <input
                type="text"
                name="bairro"
                disabled={!editando}
                value={form.bairro}
                onChange={handleChange}
                placeholder="Bairro"
              />
            </div>
            <div>
              <label>Cidade</label>
              <input
                type="text"
                name="cidade"
                disabled={!editando}
                value={form.cidade}
                onChange={handleChange}
                placeholder="Cidade"
              />
            </div>
            <div>
              <label>Estado</label>
              <input
                type="text"
                name="estado"
                disabled={!editando}
                value={form.estado}
                onChange={handleChange}
                placeholder="Estado"
              />
            </div>
          </div>
          {/* CEP + buscar */}
          <div className="perfil-branco-form-row">
            <div>
              <label>CEP</label>
              <input
                type="text"
                name="cep"
                disabled={!editando}
                value={form.cep}
                onChange={handleChange}
                placeholder="CEP"
              />
            </div>
            <div>
              <button
                className="perfil-branco-btn-buscar"
                type="button"
                onClick={buscarCep}
                disabled={!editando}
              >
                Buscar CEP
              </button>
            </div>
          </div>
        </div>
        <div className="perfil-branco-actions">
          {editando ? (
            <>
              <button
                type="button"
                className="perfil-branco-btn-discard"
                onClick={handleCancelar}
              >
                Discard Changes
              </button>
              <button type="submit" className="perfil-branco-btn-save">
                Save Changes
              </button>
            </>
          ) : (
            <button
              type="button"
              className="perfil-branco-btn-save"
              onClick={() => setEditando(true)}
            >
              Editar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
