// src/services/api.js
// -------------------------------------------------------------
// Cliente HTTP centralizado (Vite + Axios), pronto para cookies
// httpOnly e CORS. Funciona em DEV com proxy (/api) e em PROD
// com VITE_BACKEND_URL + VITE_API_PREFIX.
// -------------------------------------------------------------

import axios from "axios";

/**
 * Lê as envs do Vite
 * - VITE_BACKEND_URL   -> ex.: https://api.calculaaiabr.com   (PROD)
 *   (em DEV você pode deixar em branco para usar apenas o proxy /api)
 * - VITE_API_PREFIX    -> ex.: /api
 */
const IS_DEV = import.meta.env.DEV;
const RAW_BASE_URL = import.meta.env.VITE_BACKEND_URL || "";   // pode ficar vazio em DEV
const RAW_API_PREFIX = import.meta.env.VITE_API_PREFIX || "/api";

// Normalizações
const BASE_URL = String(RAW_BASE_URL).replace(/\/+$/, ""); // remove barras à direita
const API_PREFIX = ("/" + String(RAW_API_PREFIX).replace(/^\/+/, "")).replace(/\/+$/, "");

// Base final:
// - Em DEV, se não houver BASE_URL, usamos só o prefixo "/api" para bater no proxy do Vite
// - Em PROD, normalmente: "https://api.calculaaiabr.com/api"
export const FINAL_BASE_URL =
  IS_DEV && !BASE_URL ? API_PREFIX : `${BASE_URL}${API_PREFIX}`;

// Aviso útil em DEV/PROD sem BACKEND_URL
if (!BASE_URL && !IS_DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    "[API] VITE_BACKEND_URL não está definido no build. Usando caminho relativo para /api."
  );
}

/* Utilidades p/ token (se você também salvar no localStorage/cookie) */
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
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

/** Instância Axios única para todo o app */
const api = axios.create({
  baseURL: FINAL_BASE_URL,
  withCredentials: true, // necessário p/ cookies httpOnly entre subdomínios
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest", // compat com backend
  },
  // timeout: 20000, // (opcional) ajuste se quiser
});

/** Intercepta request para anexar Authorization se existir token */
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

/** Intercepta 401 para redirecionar ao login e limpar tokens locais */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("accessToken");
      } catch {}
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/**
 * ROTAS – retorne **apenas o caminho** (sem base).
 * A base (/api) já está na instância via FINAL_BASE_URL.
 *
 * ⚠️ Importante: use SEMPRE as funções (ex.: routes.login())
 * para evitar bugs do tipo "[object Promise]" na URL.
 */
export const routes = {
  // Auth / Usuário
  users: () => "/users",
  me: () => "/users/me",
  login: () => "/users/login",

  // Exemplos de outros recursos
  // receitas: () => "/receitas",
  // sugestoes: () => "/sugestoes",

  // Uploads via API
  uploads: (p = "") => (p ? `/uploads/${String(p).replace(/^\/+/, "")}` : "/uploads"),
};

/** Atalhos simples (opcionais) */
export const http = {
  get: (path, config) => api.get(path, config),
  post: (path, data, config) => api.post(path, data, config),
  put: (path, data, config) => api.put(path, data, config),
  patch: (path, data, config) => api.patch(path, data, config),
  delete: (path, config) => api.delete(path, config),
};

/** Endpoints prontos (opcional) */
export const authApi = {
  login: (payload) => api.post(routes.login(), payload), // <- use routes.login()
  me: () => api.get(routes.me()),
};

export const usersApi = {
  create: (payload) => api.post(routes.users(), payload),
  list: () => api.get(routes.users()),
};

export default api;
export { BASE_URL, API_PREFIX };
