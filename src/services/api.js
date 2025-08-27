// src/services/api.js
// Cliente HTTP centralizado para TODAS as requisições

import axios from "axios";

/**
 * Config do Vite:
 * - VITE_API_URL: ex. https://app.calculaaibr.com/api (preferred, complete API URL)
 * - VITE_BACKEND_URL: ex. https://calculaai-backend.onrender.com (fallback)
 * - VITE_API_PREFIX: ex. /api (fallback)
 */
const VITE_API_URL = import.meta?.env?.VITE_API_URL;

let FINAL_BASE_URL, BACKEND_URL;

if (VITE_API_URL) {
  // Use complete API URL if provided
  FINAL_BASE_URL = String(VITE_API_URL).replace(/\/+$/, "");
  // Extract backend URL for static files (remove /api suffix if present)
  BACKEND_URL = FINAL_BASE_URL.replace(/\/api$/, "");
} else {
  // Fallback to legacy configuration
  const RAW_BASE_URL = import.meta?.env?.VITE_BACKEND_URL || "";
  const RAW_API_PREFIX = import.meta?.env?.VITE_API_PREFIX || "/api";
  
  // normaliza
  const BASE_URL = String(RAW_BASE_URL).replace(/\/+$/, "");
  const API_PREFIX = ("/" + String(RAW_API_PREFIX || "").replace(/^\/+/, "")).replace(/\/+$/, "");
  
  // base final: https://.../api
  FINAL_BASE_URL = `${BASE_URL}${API_PREFIX}`;
  BACKEND_URL = BASE_URL;
}

console.log("[API] FINAL_BASE_URL =", FINAL_BASE_URL);

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
      } catch {}

      // deixa o App decidir o que fazer:
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("api-unauthorized"));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { FINAL_BASE_URL, BACKEND_URL };
// Backward compatibility
export { BACKEND_URL as BASE_URL };
