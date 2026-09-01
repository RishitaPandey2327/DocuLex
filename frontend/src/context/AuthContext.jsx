import { createContext, useContext, useState, useCallback } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("doculex_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("doculex_token", data.token);
    localStorage.setItem("doculex_user", JSON.stringify({ name: data.name, email: data.email }));
    setUser({ name: data.name, email: data.email });
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("doculex_token", data.token);
    localStorage.setItem("doculex_user", JSON.stringify({ name: data.name, email: data.email }));
    setUser({ name: data.name, email: data.email });
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("doculex_token");
    localStorage.removeItem("doculex_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
