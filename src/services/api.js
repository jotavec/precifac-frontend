// src/services/api.js
// Cliente HTTP centralizado para TODAS as requisições

import axios from "axios";

/**
 * Lê as variáveis do Vite e normaliza.
 * - VITE_BACKEND_URL: ex. http://44.194.33.48
 * - VITE_API_PREFIX: ex. /api
 */
const RAW_BASE_URL = import.meta.env.VITE_BACKEND_URL; // defina em .env(.production)
const RAW_API_PREFIX = import.meta.env.VITE_API_PREFIX || "/api";

// remove barras à direita da base e garante que o prefix tenha 1 barra à esquerda
const BASE_URL = String(RAW_BASE_URL || "").replace(/\/+$/, "");
const API_PREFIX = ("/" + String(RAW_API_PREFIX || "").replace(/^\/+/, "")).replace(/\/+$/, "");

// base final: http://44.194.33.48/api (por exemplo)
export const FINAL_BASE_URL = `${BASE_URL}${API_PREFIX}`;

if (!RAW_BASE_URL) {
  console.error(
    "[API] VITE_BACKEND_URL NÃO definida. Ajuste seu arquivo .env(.production)."
  );
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

/** Axios instance apontando para a API */
const api = axios.create({
  baseURL: FINAL_BASE_URL,
  withCredentials: true, // envia/recebe cookies (SameSite=None; Secure) se houver
  headers: { "Content-Type": "application/json" },
});

/** Intercepta pedido para injetar Authorization se houver token */
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

/** Intercepta resposta 401 e manda para /login */
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
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/**
 * ROTAS — funções SINCRONAS que retornam strings.
 * Nada de async/await aqui (evita URL “[object Promise]”).
 */
export const routes = {
  // usuários
  users: () => "/users",
  me: () => "/users/me",
  login: () => "/users/login",

  // exemplo de uploads ou outros recursos
  uploads: (path = "") => (path ? `/uploads/${String(path).replace(/^\/+/, "")}` : "/uploads"),

  // caso use outras entidades:
  // receitas: () => "/receitas",
  // sugestoes: () => "/sugestoes",
};

/** Helpers de requisição (opcionais) */
export const http = {
  get: (path, config) => api.get(path, config),
  post: (path, data, config) => api.post(path, data, config),
  put: (path, data, config) => api.put(path, data, config),
  patch: (path, data, config) => api.patch(path, data, config),
  delete: (path, config) => api.delete(path, config),
};

/** Exemplos de “endpoints prontos” (opcional) */
export const authApi = {
  login: (payload) => api.post(routes.login(), payload),
  me: () => api.get(routes.me()),
};

export const usersApi = {
  create: (payload) => api.post(routes.users(), payload),
  list: () => api.get(routes.users()),
};

const cors = require("cors");

app.use(cors({
  origin: ["http://44.194.33.48", "http://localhost:5173"],
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options("*", cors()); // preflight


export default api;
export { BASE_URL, API_PREFIX };

