import { useState, useEffect } from "react";
import api, { BASE_URL } from "../services/api";
import ModalToast from "./modals/ModalToast";
import PerfilLoginSenha from "./PerfilLoginSenha";
import TabelaPlanos from "./TabelaPlanos";
import "./Perfil.css";

/* ==================== Helpers ==================== */
function pickAvatarFrom(data) {
  return (
    data?.avatarUrl ||
    data?.avatar ||
    data?.url ||
    data?.photoUrl ||
    data?.photo ||
    null
  );
}

// normaliza caminho e monta URL final
function getFullAvatarUrl(avatarUrl) {
  if (!avatarUrl) return null;
  let raw = String(avatarUrl);
  if (/^https?:\/\//i.test(raw)) return raw;
  return `/avatars/${raw}`;
}

function AvatarSidebar({ avatarUrl }) {
  return (
    <div
      className="perfil-avatar-branco"
      style={{ position: "relative", width: 120, height: 120 }}
    >
      {avatarUrl ? (
        <img
          src={getFullAvatarUrl(avatarUrl)}
          alt="Avatar"
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            objectFit: "cover",
            border: "3px solid #ececec",
            background: "#ececec",
          }}
        />
      ) : (
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="60" fill="#ececec" />
          <text
            x="50%"
            y="58%"
            textAnchor="middle"
            fontSize="52"
            fill="#bbb"
            dy=".3em"
            fontWeight="bold"
          >
            👤
          </text>
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
        <path d="M17.1 6.55a1.4 1.4 0 0 0 0-2l-2-2a1.4 1.4 0 0 0-2 0l-1.1 1.1 4 4 1.1-1.1zm-2.6 2.6l-4-4-7.1 7.1c-.14.14-.23.32-.27.51l-.86 3.44c-.08.31.2.6.51.52l3.43-.87c.19-.05.37-.13.51-.27l7.1-7.1z" />
      </svg>
    </span>
  );
}

/* ==================== Component ==================== */
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
    cpf: "",
  });
  const [backup, setBackup] = useState(form);

  const [user, setUser] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const AVATARS = [
    { id: "CHEFE.png", label: "Chefe", src: "/avatars/CHEFE.png" },
    { id: "CONFEITEIRO.png", label: "Confeiteiro", src: "/avatars/CONFEITEIRO.png" },
    { id: "CONFEITEIRA.png", label: "Confeiteira", src: "/avatars/CONFEITEIRA.png" },
    { id: "COZINHEIRO.png", label: "Cozinheiro", src: "/avatars/COZINHEIRO.png" },
    { id: "GARCOM.png", label: "Garçom", src: "/avatars/GARCOM.png" },
    { id: "GARCONETE.png", label: "Garçonete", src: "/avatars/GARCONETE.png" },
  ];

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const { data } = await api.get("/users/me");
        const avatar = pickAvatarFrom(data);
        setUser({ ...data, avatarUrl: avatar });
        setAvatarPreview(avatar || null);

        let novoForm = {
          nome: data.name || "",
          email: data.email || "",
          telefone: data.telefone || "",
          cpf: data.cpf || "",
          empresaNome: "",
          cnpj: "",
          telefoneEmpresa: "",
          cep: "",
          rua: "",
          numero: "",
          bairro: "",
          cidade: "",
          estado: "",
          semNumero: false,
        };

        const resConfig = await api.get("/company-config");
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
            estado: resConfig.data.estado || "",
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
  }, [abaInicial]);

  async function handleAvatarPick(avatar) {
    try {
      await api.put("/users/me", { avatarUrl: avatar.id });
      setAvatarPreview(avatar.id);
      setUser((prev) => ({ ...prev, avatarUrl: avatar.id }));
      setToastMsg("Avatar atualizado!");
      setToastType("success");
      setShowToast(true);
    } catch {
      setToastMsg("Erro ao salvar avatar");
      setToastType("error");
      setShowToast(true);
    }
    setShowAvatarPicker(false);
  }

  async function handleSalvar() {
    setEditando(false);
    setLoading(true);
    try {
      await api.put("/users/me", {
        name: form.nome,
        cpf: form.cpf,
        telefone: form.telefone,
        avatarUrl: user.avatarUrl,
      });

      await api.post("/company-config", {
        companyName: form.empresaNome,
        cnpj: form.cnpj,
        phone: form.telefoneEmpresa,
        cep: form.cep,
        rua: form.rua,
        numero: form.semNumero ? "" : form.numero,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.estado,
        cpf: form.cpf,
      });

      setBackup(form);
      setToastMsg("Configurações salvas!");
      setToastType("success");
      setShowToast(true);
    } catch {
      setToastMsg("Erro ao salvar configurações");
      setToastType("error");
      setShowToast(true);
    }
    setLoading(false);
  }

  function handleCancelar() {
    setEditando(false);
    setForm(backup);
    setAvatarPreview(user.avatarUrl || null);
  }

  if (loading) return <div style={{ color: "#333", margin: 24 }}>Carregando...</div>;

  return (
    <>
      <div className="perfil-titulo-header">Perfil</div>

      <div className="perfil-branco-main">
        <ModalToast
          show={showToast}
          message={toastMsg}
          type={toastType}
          onClose={() => setShowToast(false)}
        />

        <div className="perfil-branco-side">
          <div
            style={{
              cursor: editando ? "pointer" : "default",
              display: "block",
              position: "relative",
              width: 120,
              height: 120,
              margin: "0 auto",
            }}
            onClick={() => editando && setShowAvatarPicker(true)}
          >
            <AvatarSidebar avatarUrl={avatarPreview || user.avatarUrl} />
            {editando && <EditIcon />}
          </div>

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
            onClick={() => setAba("planos")}
            style={{ marginBottom: 10, fontWeight: 700 }}
          >
            Planos
          </button>
          <button className="perfil-branco-btn-sair" onClick={onLogout}>
            Sair
          </button>
        </div>

        <div className="perfil-branco-content">
          {aba === "dados" && (
            <form
              autoComplete="off"
              onSubmit={(e) => {
                e.preventDefault();
                handleSalvar();
              }}
            >
              {/* ... resto do formulário igual ao seu código ... */}
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

          {aba === "login" && <PerfilLoginSenha email={form.email} />}
          {aba === "planos" && (
            <TabelaPlanos userEmail={form.email || user?.email} />
          )}
        </div>
      </div>

      {/* Modal de escolha de avatar */}
      {showAvatarPicker && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowAvatarPicker(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 24,
              maxWidth: 500,
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: 16 }}>Escolha seu avatar</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 16,
              }}
            >
              {AVATARS.map((a) => (
                <div
                  key={a.id}
                  style={{
                    textAlign: "center",
                    cursor: "pointer",
                    border:
                      avatarPreview === a.id
                        ? "3px solid #00b1ff"
                        : "2px solid transparent",
                    borderRadius: 12,
                    padding: 6,
                  }}
                  onClick={() => handleAvatarPick(a)}
                >
                  <img
                    src={a.src}
                    alt={a.label}
                    style={{
                      width: "100%",
                      height: 100,
                      objectFit: "contain",
                    }}
                  />
                  <div style={{ marginTop: 6, fontSize: 14 }}>{a.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
