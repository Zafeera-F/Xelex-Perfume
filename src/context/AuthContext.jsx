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

  async function login({ email, password }) {
    const { user: loggedInUser } = await apiRequest("/api/auth/login", {
      method: "POST",
      body: { email, password },
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

  async function changePassword({ currentPassword, newPassword }) {
    await apiRequest("/api/auth/change-password", {
      method: "PATCH",
      body: { currentPassword, newPassword },
    });
  }

  const value = { user, status, login, register, logout, changePassword, refreshProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
