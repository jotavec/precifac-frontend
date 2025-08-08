import React, { createContext, useContext } from "react";

// Contexto fake, só para não dar erro (melhore depois!)
const AuthContext = createContext({
  user: null, // ou coloque um user fake para testar planos
});

export function AuthProvider({ children }) {
  return (
    <AuthContext.Provider value={{ user: null }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
