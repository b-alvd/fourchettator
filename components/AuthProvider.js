"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/auth/me");
      const d = await r.json();
      setUser(d.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    function onStorage(e) {
      if (e.key === "fc-auth-change") window.location.href = "/";
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, refresh, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
