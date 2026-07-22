import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiRequest } from "../lib/api";

// The session itself lives in an httpOnly cookie the frontend can't read, so
// on first load we don't know whether the visitor is logged in — `status`
// starts "loading" and a GET /api/auth/profile call resolves it to either
// "authenticated" (with `user` populated) or "guest". Every consumer that
// needs to gate on auth (Profile page, Navbar) should check `status`, not
// just truthiness of `user`, so a guest isn't briefly treated as logged out
// before the initial check finishes.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "authenticated" | "guest"

  const refreshProfile = useCallback(async () => {
    try {
      const { user: profile } = await apiRequest("/api/auth/profile");
      setUser(profile);
      setStatus("authenticated");
      return profile;
    } catch {
      setUser(null);
      setStatus("guest");
      return null;
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // MFA-enabled accounts don't get a session from this call alone — the
  // backend issues only a short-lived pending cookie and expects a second
  // call to verifyMfaLogin with a TOTP code. Callers must check
  // `mfaRequired` on the result rather than assuming login() always signs
  // the user in.
  async function login({ identifier, password }) {
    const result = await apiRequest("/api/auth/login", {
      method: "POST",
      body: { identifier, password },
    });
    if (result.mfaRequired) {
      return { mfaRequired: true };
    }
    setUser(result.user);
    setStatus("authenticated");
    return { mfaRequired: false, user: result.user };
  }

  async function verifyMfaLogin(code) {
    const { user: loggedInUser } = await apiRequest("/api/auth/mfa/login-verify", {
      method: "POST",
      body: { code },
    });
    setUser(loggedInUser);
    setStatus("authenticated");
    return loggedInUser;
  }

  async function register({ fullName, email, password, phone }) {
    const { user: newUser } = await apiRequest("/api/auth/register", {
      method: "POST",
      body: { fullName, email, password, phone },
    });
    setUser(newUser);
    setStatus("authenticated");
    return newUser;
  }

  async function logout() {
    await apiRequest("/api/auth/logout", { method: "POST" });
    setUser(null);
    setStatus("guest");
  }

  async function updateProfile(fields) {
    const { user: updatedUser } = await apiRequest("/api/auth/profile", {
      method: "PATCH",
      body: fields,
    });
    setUser(updatedUser);
    return updatedUser;
  }

  async function changePassword({ currentPassword, newPassword }) {
    await apiRequest("/api/auth/change-password", {
      method: "PATCH",
      body: { currentPassword, newPassword },
    });
  }

  // Optional for customers — toggled from the Profile page. Returns
  // { secret, qrCodeDataUrl } for MfaSetup to render; mfaEnabled only
  // flips once confirmMfaSetup verifies the first code.
  async function setupMfa() {
    return apiRequest("/api/auth/mfa/setup", { method: "POST" });
  }

  async function confirmMfaSetup(code) {
    await apiRequest("/api/auth/mfa/verify-setup", { method: "POST", body: { code } });
    await refreshProfile();
  }

  async function disableMfa(password) {
    await apiRequest("/api/auth/mfa/disable", { method: "POST", body: { password } });
    await refreshProfile();
  }

  const value = {
    user,
    status,
    login,
    verifyMfaLogin,
    register,
    logout,
    updateProfile,
    changePassword,
    setupMfa,
    confirmMfaSetup,
    disableMfa,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
