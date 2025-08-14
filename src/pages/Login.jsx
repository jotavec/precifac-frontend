// src/pages/Login.jsx
import React, { useState } from "react";
import "./Login.css";

export default function Login({
  screen: initialScreen = "login",
  setScreen: setParentScreen = () => {},
  form,
  handleChange,
  handleLogin,
  handleRegister,
  msg = "",
}) {
  // este componente NÃO simula nada: ele exige os handlers do App
  if (!form || !handleChange || !handleLogin || !handleRegister) {
    console.error(
      "[Login.jsx] Faltam props obrigatórias: form, handleChange, handleLogin, handleRegister."
    );
  }

  const [screen, setScreen] = useState(initialScreen);
  const isLoginScreen = screen === "login";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-root">
      {/* Botão de suporte (gradiente com ícone do WhatsApp) */}
      <a
        href="https://w.app/calculaai"
        target="_blank"
        rel="noopener noreferrer"
        className="support-button"
        aria-label="Abrir suporte no WhatsApp"
        title="Falar no WhatsApp"
      >
        {/* Ícone WhatsApp (SVG vetorial, 25x25) */}
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
            d="M.057 24l1.687-6.163A11.867 11.867 0 01.157 11.892C.16 5.3 5.419 0 12.062 0 15.232 0 18.23 1.24 20.476 3.488a11.82 11.82 0 013.486 8.414c-.003 6.644-5.312 12.006-11.956 12.006a11.95 11.95 0 01-5.938-1.594L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.593 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.89 4.434-9.893 9.886a9.86 9.86 0 001.599 5.261l-.999 3.648 3.893-1.611zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.867-2.03-.967-.272-.1-.47-.149-.669.149-.198.297-.77.966-.944 1.164-.17.19-.34.22-.63.08-.29-.15-1.24-.45-2.36-1.45-.87-.77-1.46-1.71-1.63-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.08-.15-.64-1.54-.88-2.11-.23-.56-.47-.48-.64-.49h-.55c-.19 0-.51.08-.78.36-.26.29-1 1-1 2.42 0 1.42 1.03 2.79 1.18 2.98.15.19 2.02 3.08 4.89 4.2.68.29 1.21.46 1.62.58.68.22 1.3.19 1.79.11.55-.08 1.7-.69 1.94-1.36.24-.66.24-1.23.17-1.35-.06-.12-.23-.19-.52-.34z"
          />
        </svg>
        <span>Suporte</span>
      </a>

      {/* ESQUERDA: vídeo (sem loop; toca 1x e pausa) */}
      <div className="login-left">
        <video
          src="/video/login-loop.mp4"
          autoPlay
          muted
          playsInline
          preload="metadata"
          onEnded={(e) => e.currentTarget.pause()}
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
            <h1 className="login-title">{isLoginScreen ? "Entrar" : "Criar conta"}</h1>

            <form onSubmit={isLoginScreen ? handleLogin : handleRegister}>
              {!isLoginScreen && (
                <>
                  <label className="login-label" htmlFor="name">Nome</label>
                  <input
                    id="name"
                    name="name"
                    placeholder="Seu nome completo"
                    value={form?.name || ""}
                    onChange={handleChange}
                    className="login-input"
                    required
                  />
                </>
              )}

              <label className="login-label" htmlFor="email">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={form?.email || ""}
                onChange={handleChange}
                className="login-input"
                autoComplete="email"
                required
              />

              <label className="login-label" htmlFor="password">Senha</label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form?.password || ""}
                  onChange={handleChange}
                  className="login-input"
                  autoComplete="current-password"
                  required
                />
                {/* Botão olho (mostrar/ocultar senha) */}
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  {showPassword ? (
                    // Eye-off
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M3 3l18 18" stroke="#666" strokeWidth="2" strokeLinecap="round" />
                      <path d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.08A10.85 10.85 0 0112 5c7 0 10 7 10 7a13.32 13.32 0 01-3.26 4.33M6.12 6.12A13.32 13.32 0 002 12s3 7 10 7a10.85 10.85 0 003.88-.72" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    // Eye
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="#666" strokeWidth="2" />
                    </svg>
                  )}
                </button>
              </div>

              <button type="submit" className="login-primary">
                {isLoginScreen ? "Entrar" : "Cadastrar"}
              </button>
            </form>

            <div className="login-footer">
              <span style={{ color: "#666" }}>
                {isLoginScreen ? "Novo por aqui?" : "Já tem conta?"}
              </span>
              <button
                type="button"
                className="login-link"
                onClick={() => {
                  const next = isLoginScreen ? "register" : "login";
                  setScreen(next);
                  setParentScreen(next);
                }}
              >
                {isLoginScreen ? "Criar conta" : "Fazer login"}
              </button>
            </div>

            {!!msg && (
              <div style={{ color: "#900", marginTop: 8, textAlign: "center" }}>
                {msg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
