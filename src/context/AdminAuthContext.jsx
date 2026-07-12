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

  // MFA-enabled admins don't get a session from this call alone — see
  // AuthContext.login for the same two-step shape on the customer side.
  async function login({ email, password }) {
    const result = await apiRequest("/api/admin/auth/login", {
      method: "POST",
      body: { email, password },
    });
    if (result.mfaRequired) {
      return { mfaRequired: true };
    }
    setAdmin(result.admin);
    setStatus("authenticated");
    return { mfaRequired: false, admin: result.admin };
  }

  async function verifyMfaLogin(code) {
    const { admin: loggedInAdmin } = await apiRequest("/api/admin/auth/mfa/login-verify", {
      method: "POST",
      body: { code },
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

  // Mandatory for every admin — no disable endpoint exists on this realm
  // (see backend/src/services/admin.service.js). setupMfa/confirmMfaSetup
  // mirror the customer versions; AdminLayout redirects here whenever
  // admin.mfaEnabled is false, regardless of which route was requested.
  async function setupMfa() {
    return apiRequest("/api/admin/auth/mfa/setup", { method: "POST" });
  }

  async function confirmMfaSetup(code) {
    await apiRequest("/api/admin/auth/mfa/verify-setup", { method: "POST", body: { code } });
    await refreshProfile();
  }

  const value = {
    admin,
    status,
    login,
    verifyMfaLogin,
    logout,
    setupMfa,
    confirmMfaSetup,
    refreshProfile,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return ctx;
}
