// Refresh token helpers — deliberately NOT a JWT. A refresh token needs to
// be revocable (log out, rotation-on-reuse-detection), and a signed JWT's
// whole point is being verifiable without a DB round-trip — the opposite
// of what's needed here. Instead: a random opaque string handed to the
// client, with only its SHA-256 hash ever stored in the DB (RefreshToken /
// AdminRefreshToken) — same reasoning as never storing a plaintext
// password, a DB read alone should never be enough to impersonate a
// session.

import crypto from "crypto";

export const REFRESH_TOKEN_EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days — matches the session length customers/admins already had before this change

export function generateRefreshToken() {
  return crypto.randomBytes(40).toString("hex");
}

export function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
