// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import api, { API_URL } from "../services/api"; // se seu alias "@" estiver configurado, pode usar "@/services/api"

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async (_email, _password) => {},
  logout: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Busca o usuário logado no mount
  const loadMe = async () => {
    try {
      const { data } = await api.get(`${API_URL}/users/me`);
      setUser(data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Faz login, salva token e atualiza o usuário
  const login = async (email, password) => {
    const { data } = await api.post(`${API_URL}/users/login`, { email, password });
    // salva o token para o interceptor injetar nos próximos requests
    try {
      localStorage.setItem("token", data?.token || "");
    } catch {}
    await loadMe();
    return data;
  };

  // Faz logout no backend e limpa o token local
  const logout = async () => {
    try {
      await api.post(`${API_URL}/users/logout`);
    } catch {}
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("accessToken");
    } catch {}
    setUser(null);
  };

  const refresh = async () => loadMe();

  const value = useMemo(
    () => ({ user, loading, login, logout, refresh }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
