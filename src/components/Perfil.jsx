import { useState, useEffect } from "react";
import axios from "axios";
import ModalToast from "./modals/ModalToast";
import PerfilLoginSenha from "./PerfilLoginSenha";
import Cropper from "react-easy-crop";
import TabelaPlanos from "./TabelaPlanos";
import './Perfil.css';

const API_URL = "/api";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

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

function getFullAvatarUrl(avatarUrl) {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith("http")) return avatarUrl;
  return BACKEND_URL.replace(/\/$/, "") + "/" + avatarUrl.replace(/^\//, "");
}

function AvatarSidebar({ avatarUrl }) {
  return (
    <div className="perfil-avatar-branco" style={{ position: 'relative', width: 120, height: 120 }}>
      {avatarUrl ? (
        <img
          src={getFullAvatarUrl(avatarUrl)}
          alt="Avatar"
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            objectFit: 'cover',
            border: "3px solid #ececec",
            background: "#ececec"
          }}
        />
      ) : (
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="60" fill="#ececec" />
          <text x="50%" y="58%" textAnchor="middle" fontSize="52" fill="#bbb" dy=".3em" fontWeight="bold">👤</text>
        </svg>
      )}
    </div>
  );
}

function EditIcon() {
  return (
    <span
      style={{
        position: "absolute",
        bottom: 8,
        right: 10,
        background: "#00b1ff",
        borderRadius: "50%",
        width: 40,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 12px #0002",
        border: "3px solid #fff",
        zIndex: 2,
      }}
    >
      <svg width="22" height="22" fill="#fff" viewBox="0 0 20 20">
        <path d="M17.1 6.55a1.4 1.4 0 0 0 0-2l-2-2a1.4 1.4 0 0 0-2 0l-1.1 1.1 4 4 1.1-1.1zm-2.6 2.6l-4-4-7.1 7.1c-.14.14-.23.32-.27.51l-.86 3.44c-.08.31.2.6.51.52l3.43-.87c.19-.05.37-.13.51-.27l7.1-7.1z"/>
      </svg>
    </span>
  );
}

function getCroppedImg(imageSrc, crop, zoom, aspect) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cropX = (crop.x / 100) * image.width;
      const cropY = (crop.y / 100) * image.height;
      const side = Math.min(image.width, image.height) / zoom;

      const sx = (image.width - side) / 2 + cropX;
      const sy = (image.height - side) / 2 + cropY;

      ctx.save();
      ctx.beginPath();
      ctx.arc(128, 128, 128, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(
        image,
        sx, sy, side, side,
        0, 0, 256, 256
      );
      ctx.restore();

      canvas.toBlob(blob => {
        resolve({
          blob,
          url: URL.createObjectURL(blob)
        });
      }, 'image/png');
    };
    image.onerror = reject;
  });
}

async function uploadAvatar(blob) {
  const formData = new FormData();
  formData.append('avatar', blob, 'avatar.png');
  const { data } = await axios.post('/api/users/me/avatar', formData, {
    withCredentials: true,
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data.avatarUrl;
}

export default function Perfil({ onLogout, abaInicial }) {
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState(abaInicial || "dados");
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

  const [user, setUser] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropFileUrl, setCropFileUrl] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  useEffect(() => {
    if (abaInicial && abaInicial !== aba) {
      setAba(abaInicial);
      console.log("Perfil.jsx - Recebeu abaInicial:", abaInicial);
    }
    // eslint-disable-next-line
  }, [abaInicial]);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_URL}/users/me`, { withCredentials: true });
        setUser(data);
        setAvatarPreview(data.avatarUrl || null);
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

  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setCropFileUrl(url);
    setShowCrop(true);
  }, [avatarFile]);

  async function onCropConfirm() {
    const cropped = await getCroppedImg(cropFileUrl, crop, zoom, 1);
    const avatarUrl = await uploadAvatar(cropped.blob);
    const avatarUrlCacheBusted = avatarUrl + "?t=" + Date.now();
    setAvatarPreview(avatarUrlCacheBusted);
    setUser((prev) => ({ ...prev, avatarUrl: avatarUrlCacheBusted }));
    setShowCrop(false);
    setAvatarFile(null);
    URL.revokeObjectURL(cropFileUrl);
  }

  function onCropCancel() {
    setShowCrop(false);
    setAvatarFile(null);
    if (cropFileUrl) URL.revokeObjectURL(cropFileUrl);
  }

  function onCropChange(newCrop) {
    setCrop(newCrop);
  }

  function onZoomChange(newZoom) {
    setZoom(newZoom);
  }

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
    setForm(backup);
    setAvatarFile(null);
    setAvatarPreview(user.avatarUrl || null);
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
    }
  }

  if (loading) return <div style={{ color: "#333", margin: 24 }}>Carregando...</div>;

  // DEBUG ABA ATUAL
  console.log("Perfil.jsx - aba atual:", aba, "| abaInicial prop:", abaInicial);

  return (
    <>
      {showCrop && (
        <div
          style={{
            position: "fixed",
            zIndex: 9999,
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(10,16,40,0.58)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div style={{
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 4px 40px #0002",
            padding: 36,
            minWidth: 340,
            minHeight: 370,
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            <div style={{ position: "relative", width: 280, height: 280, background: "#f7fafb", borderRadius: "50%", overflow: "hidden" }}>
              <Cropper
                image={cropFileUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={onCropChange}
                onCropComplete={(_, croppedAreaPixels) => { }}
                onZoomChange={onZoomChange}
                style={{
                  containerStyle: { borderRadius: "50%", overflow: "hidden" }
                }}
              />
            </div>
            <div style={{ marginTop: 24, display: "flex", gap: 20 }}>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                style={{ width: 140 }}
              />
              <span style={{ fontSize: 15, color: "#0094e7", fontWeight: 600 }}>Zoom</span>
            </div>
            <div style={{ marginTop: 32, display: "flex", gap: 18 }}>
              <button
                onClick={onCropCancel}
                style={{
                  padding: "9px 22px",
                  background: "#fff",
                  color: "#222",
                  borderRadius: 12,
                  border: "2px solid #ddd",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: "pointer"
                }}
              >
                Cancelar
              </button>
              <button
                onClick={onCropConfirm}
                style={{
                  padding: "10px 26px",
                  background: "#00b1ff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  boxShadow: "0 3px 24px #00cfff21"
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="perfil-titulo-header">
        Perfil
      </div>

      <div className="perfil-branco-main">
        <ModalToast
          show={showToast}
          message={toastMsg}
          type={toastType}
          onClose={() => setShowToast(false)}
        />

        <div className="perfil-branco-side">
          <label
            htmlFor="avatar-upload"
            style={{
              cursor: editando ? "pointer" : "default",
              display: "block",
              position: "relative",
              width: 120,
              height: 120,
              margin: "0 auto"
            }}
          >
            <AvatarSidebar avatarUrl={avatarPreview || user.avatarUrl} />
            {editando && <EditIcon />}
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
              disabled={!editando}
            />
          </label>

          <div className="perfil-branco-nome">{form.nome || "Seu Nome"}</div>
          <div className="perfil-branco-cargo">Usuário</div>
          <button
            className={`perfil-branco-btn-info${aba === "dados" ? " ativo" : ""}`}
            onClick={() => setAba("dados")}
          >
            Dados Pessoais
          </button>
          <button
            className={`perfil-branco-btn-info${aba === "login" ? " ativo" : ""}`}
            onClick={() => setAba("login")}
            style={{ marginBottom: 10 }}
          >
            Login & Senha
          </button>
          <button
            className={`perfil-branco-btn-info${aba === "planos" ? " ativo" : ""}`}
            onClick={() => {
              console.log("Perfil.jsx - Clique em Planos, setAba('planos')");
              setAba("planos");
            }}
            style={{ marginBottom: 10, fontWeight: 700 }}
          >
            Planos
          </button>
          <button
            className="perfil-branco-btn-info"
            onClick={onLogout}
            style={{ fontWeight: 700 }}
          >
            Sair
          </button>
        </div>

        <div className="perfil-branco-content">
          {console.log("Perfil.jsx - Renderizando aba:", aba)}
          {aba === "dados" && (
            <form
              autoComplete="off"
              onSubmit={e => { e.preventDefault(); handleSalvar(); }}
            >
              <h2 className="perfil-branco-titulo">Dados Pessoais</h2>
              <div className="perfil-branco-form">
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
                <div className="perfil-branco-form-row">
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

                <h2 className="perfil-branco-titulo" style={{ marginTop: 32, marginBottom: 0 }}>Dados Empresariais</h2>

                <div className="perfil-branco-form-row" style={{ alignItems: "flex-end" }}>
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
                  <div style={{ display: "flex", alignItems: "flex-end", height: "100%" }}>
                    <button
                      className="perfil-branco-btn-buscar"
                      type="button"
                      onClick={buscarCep}
                      disabled={!editando}
                      style={{ width: "100%", minHeight: 44 }}
                    >
                      Buscar CEP
                    </button>
                  </div>
                </div>

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
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                      <label style={{ margin: 0 }}>Número</label>
                      <label style={{ display: "flex", alignItems: "center", fontSize: 12, fontWeight: 500, color: "#8b8b8b" }}>
                        <input
                          type="checkbox"
                          checked={form.semNumero}
                          disabled={!editando}
                          onChange={handleSemNumeroClick}
                          style={{ marginRight: 5, marginTop: 0 }}
                        />
                        Sem número
                      </label>
                    </div>
                    <input
                      type="text"
                      name="numero"
                      disabled={!editando || form.semNumero}
                      value={form.numero}
                      onChange={handleChange}
                      placeholder="Nº"
                    />
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
                <div className="perfil-branco-form-row">
                  <div>
                    <label>Razão Social</label>
                    <input
                      type="text"
                      name="empresaNome"
                      disabled={!editando}
                      value={form.empresaNome}
                      onChange={handleChange}
                      placeholder="Razão Social"
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
              </div>
              <div className="perfil-branco-actions">
                {editando ? (
                  <>
                    <button
                      type="button"
                      className="perfil-branco-btn-discard"
                      onClick={handleCancelar}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="perfil-branco-btn-save">
                      Salvar
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
          )}
          {aba === "login" && (
            <PerfilLoginSenha email={form.email} />
          )}
          {aba === "planos" && <TabelaPlanos />}
        </div>
      </div>
    </>
  );
}
