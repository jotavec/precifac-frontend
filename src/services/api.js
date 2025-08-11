// src/services/api.js
// Cliente HTTP centralizado para injetar o token em TODAS as requisições

import axios from "axios";

// Normaliza a URL do backend vinda do .env
const BASE_URL =
  (import.meta?.env?.VITE_BACKEND_URL || "http://localhost:3000")
    .replace(/\/+$/, "");

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(^| )" + name + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[2]) : null;
}

function getToken() {
  try {
    // Tentamos chaves comuns; ajuste depois se sua chave for outra
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

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true, // mantém cookies (se o backend usar)
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: injeta Authorization: Bearer <token>
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

// Interceptor de resposta: trata 401
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

export default api;
export { BASE_URL };
