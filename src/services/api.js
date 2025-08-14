// src/services/api.js
// Cliente HTTP centralizado para TODAS as requisições

import axios from "axios";

/**
 * Lê as variáveis do Vite e normaliza.
 * - VITE_BACKEND_URL: ex. https://calculaai-backend.onrender.com
 * - VITE_API_PREFIX: ex. /api
 */
const RAW_BASE_URL = import.meta.env.VITE_BACKEND_URL; // sem fallback!
const RAW_API_PREFIX = import.meta.env.VITE_API_PREFIX || "/api";

// remove barras à direita da base e garante que o prefix tenha 1 barra à esquerda
const BASE_URL = String(RAW_BASE_URL || "").replace(/\/+$/, "");
const API_PREFIX = ("/" + String(RAW_API_PREFIX || "").replace(/^\/+/, "")).replace(/\/+$/, "");

// base final: https://.../api
const FINAL_BASE_URL = `${BASE_URL}${API_PREFIX}`;

// (opcional) alerta claro se as envs não estiverem setadas
if (!RAW_BASE_URL) {
  // Evita cair em localhost silenciosamente
  // Em produção, garanta VITE_BACKEND_URL configurada no Vercel.
  console.error("[API] VITE_BACKEND_URL NÃO definida. Ajuste as variáveis de ambiente do Vercel.");
}

/* Utilidades para pegar token (se você também persistir no localStorage/cookie) */
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function getToken() {
  try {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken") ||
      getCookie("token") ||
      getCookie("authToken") ||
      getCookie("accessToken") ||
      null
    );
  } catch {
    return null;
  }
}

/* Axios instance apontando DIRETO pro backend (Render) */
const api = axios.create({
  baseURL: FINAL_BASE_URL,
  withCredentials: true, // envia/recebe cookies (SameSite=None; Secure)
  headers: {
    "Content-Type": "application/json",
  },
});

/* Interceptor: injeta Authorization: Bearer <token> (opcional, além do cookie) */
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && !config.headers?.Authorization) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* Interceptor de resposta: trata 401 e redireciona para /login */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("accessToken");
      } catch {}
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { BASE_URL, API_PREFIX, FINAL_BASE_URL };
