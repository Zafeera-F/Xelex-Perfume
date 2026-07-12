import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiRequest } from "../lib/api";

// Mirrors AuthContext.jsx exactly, calling /api/admin/auth/* instead — a
// separate realm from the customer session with its own cookie
// (xelex_admin_token, set server-side), so an admin and a customer can be
// logged in on the same browser at once without collision.

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "authenticated" | "guest"

  const refreshProfile = useCallback(async () => {
    try {
      const { admin: profile } = await apiRequest("/api/admin/auth/profile");
      setAdmin(profile);
      setStatus("authenticated");
      return profile;
    } catch {
      setAdmin(null);
      setStatus("guest");
      return null;
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  async function login({ email, password }) {
    const { admin: loggedInAdmin } = await apiRequest("/api/admin/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setAdmin(loggedInAdmin);
    setStatus("authenticated");
    return loggedInAdmin;
  }

  async function logout() {
    await apiRequest("/api/admin/auth/logout", { method: "POST" });
    setAdmin(null);
    setStatus("guest");
  }

  const value = { admin, status, login, logout, refreshProfile };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return ctx;
}
