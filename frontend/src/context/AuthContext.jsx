import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // null = loading, false = anon, object = user
  const [limits, setLimits] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const [{ data: u }, { data: l }] = await Promise.all([
        api.get("/auth/me"),
        api.get("/limits"),
      ]);
      setUser(u);
      setLimits(l);
      return u;
    } catch (e) {
      setUser(false);
      setLimits(null);
      return null;
    }
  }, []);

  useEffect(() => {
    // CRITICAL: If returning from OAuth callback, skip /me check
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    if (typeof window !== "undefined" && window.location.hash?.includes("session_id=")) {
      return;
    }
    refresh();
  }, [refresh]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data);
    await refresh();
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    setUser(data);
    await refresh();
    return data;
  };

  const googleExchange = async (sessionId) => {
    const { data } = await api.post("/auth/google", { session_id: sessionId });
    setUser(data);
    await refresh();
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {}
    setUser(false);
    setLimits(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, limits, login, register, googleExchange, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export function formatApiErrorDetail(detail) {
  if (detail == null) return "Algo deu errado. Tente novamente.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}
