// src/pages/Login.jsx
import React, { useState } from "react";
import "./Login.css";

export default function Login({
  screen: initialScreen = "login",
  setScreen: setParentScreen = () => {},
}) {
  const [screen, setScreen] = useState(initialScreen);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiSuggestions, setGeminiSuggestions] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setMsg("Login simulado com sucesso!");
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setMsg("Registro simulado com sucesso!");
  };

  const callGeminiApi = async (prompt) => {
    let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.candidates?.length && result.candidates[0].content?.parts?.length) {
        const text = result.candidates[0].content.parts[0].text;
        return text
          .split("\n")
          .map((s) => s.replace(/[-* ]/g, "").trim())
          .filter(Boolean);
      } else {
        throw new Error("Resposta da API inválida.");
      }
    } catch (error) {
      console.error("Erro ao chamar a API Gemini:", error);
      throw error;
    }
  };

  const handleGeminiClick = async () => {
    if (!form.name) {
      setMsg("Por favor, insira seu nome primeiro.");
      return;
    }
    setGeminiLoading(true);
    setMsg("");
    setGeminiSuggestions([]);
    try {
      const prompt = `Sugira 5 nomes de usuário criativos e seguros baseados no nome "${form.name}". Liste apenas os nomes de usuário, um por linha.`;
      const suggestions = await callGeminiApi(prompt);
      setGeminiSuggestions(suggestions);
    } catch {
      setMsg("Não foi possível obter sugestões. Tente novamente.");
    } finally {
      setGeminiLoading(false);
    }
  };

  const isLoginScreen = screen === "login";

  return (
    <div className="login-root">
      {/* Botão de suporte (gradiente + ícone WhatsApp alinhado 25x25) */}
      <a
        href="https://w.app/calculaai"
        target="_blank"
        rel="noopener noreferrer"
        className="support-button"
        aria-label="Abrir suporte no WhatsApp"
        title="Falar no WhatsApp"
      >
        {/* Ícone oficial (Simple Icons) — centrado e nítido */}
        <svg
          className="support-button__icon"
          viewBox="0 0 24 24"
          width="25"
          height="25"
          role="img"
          aria-hidden="true"
          focusable="false"
          style={{ display: "block" }}
        >
          <path
            fill="currentColor"
            d="M.057 24l1.687-6.163A11.867 11.867 0 01.157 11.892C.16 5.3 5.419 0 12.062 0c3.17 0 6.167 1.24 8.413 3.488a11.82 11.82 0 013.486 8.414c-.003 6.644-5.312 12.006-11.956 12.006a11.95 11.95 0 01-5.938-1.594L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.593 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.89 4.434-9.893 9.886a9.86 9.86 0 001.599 5.261l-.999 3.648 3.893-1.611zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.867-2.03-.967-.272-.1-.47-.149-.669.149-.198.297-.77.966-.944 1.164-.173.198-.346.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.777-1.48-1.742-1.653-2.04-.173-.297-.018-.457.13-.606.134-.133.297-.346.446-.52.149-.173.198-.297.297-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.501-.669-.51-.173-.01-.37-.012-.568-.012-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"
          />
        </svg>
        <span>Suporte</span>
      </a>

      {/* ESQUERDA: vídeo centralizado (coloque o arquivo em public/video/login-loop.mp4) */}
      <div className="login-left">
        <video
          src="/video/login-loop.mp4"
          autoPlay
          muted
          playsInline
          preload="metadata"
          onEnded={(e) => e.currentTarget.pause()} /* toca 1x e congela no último frame */
        >
          Seu navegador não suporta vídeos HTML5.
        </video>
      </div>

      {/* DIREITA: átomo + card */}
      <div className="login-right">
        <div className="login-center">
          <img
            src={`${import.meta.env.BASE_URL}logo-login.png`}
            alt="Logo Átomo"
            className="login-atom"
          />

          <div className="login-card" role="form" aria-label="Login">
            <h1 className="login-title">
              {isLoginScreen ? "Entrar" : "Criar conta"}
            </h1>

            <form onSubmit={isLoginScreen ? handleLogin : handleRegister}>
              {!isLoginScreen && (
                <>
                  <label className="login-label" htmlFor="name">
                    Nome
                  </label>
                  <input
                    id="name"
                    name="name"
                    placeholder="Seu nome completo"
                    value={form.name}
                    onChange={handleChange}
                    className="login-input"
                    required
                  />
                  <button
                    type="button"
                    className="gemini-button"
                    onClick={handleGeminiClick}
                    disabled={geminiLoading}
                  >
                    {geminiLoading ? "Sugerindo..." : "Sugerir usernames ✨"}
                  </button>
                </>
              )}

              <label className="login-label" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={form.email}
                onChange={handleChange}
                className="login-input"
                autoComplete="email"
                required
              />

              <label className="login-label" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="login-input"
                autoComplete="current-password"
                required
              />

              <button type="submit" className="login-primary">
                {isLoginScreen ? "Entrar" : "Cadastrar"}
              </button>
            </form>

            {geminiSuggestions.length > 0 && (
              <div className="gemini-suggestions">
                <h4>Sugestões para você:</h4>
                <ul>
                  {geminiSuggestions.map((s, i) => (
                    <li key={i} onClick={() => setForm({ ...form, email: s })}>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="login-footer">
              <span style={{ color: "#666" }}>
                {isLoginScreen ? "Novo por aqui?" : "Já tem conta?"}
              </span>
              <button
                type="button"
                className="login-link"
                onClick={() => {
                  setScreen(isLoginScreen ? "register" : "login");
                  setParentScreen(isLoginScreen ? "register" : "login");
                  setMsg("");
                  setGeminiSuggestions([]);
                }}
              >
                {isLoginScreen ? "Criar conta" : "Fazer login"}
              </button>
            </div>

            {!!msg && (
              <div
                style={{
                  color: geminiSuggestions.length > 0 ? "#333" : "#900",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                {msg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
