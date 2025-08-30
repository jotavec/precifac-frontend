// src/services/api.js
// Cliente HTTP centralizado para TODAS as requisições

import axios from "axios";

// Base do backend (opcional) e prefixo fixo da API
const BASE_URL = (import.meta?.env?.VITE_BACKEND_URL || "").replace(/\/+$/, "");
const API_URL = "/api"; // prefixo único das rotas da API

/* Utilidades para pegar token (se você também persistir no localStorage/cookie) */
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function removeCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=0; path=/;`;
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

/* Axios instance apontando para o mesmo host do frontend
   (ou para VITE_BACKEND_URL, se definido) */
const api = axios.create({
  baseURL: BASE_URL,
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

/* Interceptor de resposta:
   >>> NÃO redireciona mais automaticamente em 401.
   Dispara um evento opcional para o app ouvir, mas não dá window.location.
*/
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // limpa tokens locais (se existirem)
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("accessToken");
        removeCookie("token");
        removeCookie("authToken");
        removeCookie("accessToken");
      } catch {
        /* ignore token removal errors */
      }

      // deixa o App decidir o que fazer:
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("api-unauthorized"));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { BASE_URL, API_URL };
