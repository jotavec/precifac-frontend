import React, { useState } from "react";
import api, { API_URL } from "../services/api";

export default function PerfilLoginSenha({ email }) {
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");
  const [msg, setMsg] = useState("");
  const [tipoMsg, setTipoMsg] = useState(""); // "erro" ou "sucesso"

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setTipoMsg("");

    if (!senha || !senha2) {
      setMsg("Preencha ambos os campos.");
      setTipoMsg("erro");
      return;
    }
    if (senha !== senha2) {
      setMsg("As senhas não coincidem.");
      setTipoMsg("erro");
      return;
    }

    try {
      const { data } = await api.post(`${API_URL}/users/change-password`, {
        senhaNova: senha,
      });

      if (data?.ok) {
        setMsg("Senha alterada com sucesso!");
        setTipoMsg("sucesso");
        setSenha("");
        setSenha2("");
      } else {
        setMsg(data?.error || "Erro ao alterar senha.");
        setTipoMsg("erro");
      }
    } catch (err) {
      const apiMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Erro ao conectar com o servidor.";
      setMsg(apiMsg);
      setTipoMsg("erro");
    }
  }

  return (
    <>
      <h2 className="perfil-branco-titulo">Login & Senha</h2>
      <div className="perfil-branco-form">
        <div className="perfil-branco-form-row">
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <label>E-mail cadastrado:</label>
            <input
              type="text"
              value={email || "Não informado"}
              disabled
              className="perfil-branco-input"
              style={{ fontWeight: 800, fontSize: "1.13rem" }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: 32, width: "100%" }}>
          <div className="perfil-branco-form-row">
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <label>Nova senha:</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="perfil-branco-form-row-input"
                placeholder="Digite a nova senha"
              />
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <label>Confirmar nova senha:</label>
              <input
                type="password"
                value={senha2}
                onChange={(e) => setSenha2(e.target.value)}
                className="perfil-branco-form-row-input"
                placeholder="Confirme a nova senha"
              />
            </div>
          </div>

          <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 18 }}>
            <button type="submit" className="perfil-branco-btn-save" style={{ width: 210 }}>
              Alterar senha
            </button>

            {msg && (
              <span
                style={{
                  color: tipoMsg === "erro" ? "#c00" : "#1a9800",
                  fontWeight: 700,
                  marginLeft: 14,
                }}
              >
                {msg}
              </span>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
