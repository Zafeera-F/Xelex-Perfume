// Auth cookie helpers — the only place that knows the cookie's name and
// options. Login, register, and logout all go through these functions so
// the cookie config (httpOnly, secure, sameSite, maxAge) can never drift
// between where it's set and where it's cleared.
//
// Three cookies now: xelex_token is the short-lived access token (sent on
// every request, site-wide path); xelex_refresh_token is the long-lived,
// revocable refresh token used only to mint new access tokens
// (utils/refreshToken.js), path-scoped to /api/auth since only the refresh
// and logout endpoints ever need it; xelex_csrf is deliberately NOT
// httpOnly — middlewares/csrf.js's double-submit pattern needs frontend JS
// to read it and echo it back as a header, which is the whole point (a
// cross-site attacker's forged request has the ambient cookie but can't
// read it to set the matching header).

export const AUTH_COOKIE_NAME = "xelex_token";
export const REFRESH_COOKIE_NAME = "xelex_refresh_token";
export const CSRF_COOKIE_NAME = "xelex_csrf";
export const MFA_PENDING_COOKIE_NAME = "xelex_mfa_pending";

const isProduction = process.env.NODE_ENV === "production";
const FIVE_MINUTES_MS = 5 * 60 * 1000;
const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_COOKIE_PATH = "/api/auth";
const MFA_PENDING_COOKIE_PATH = "/api/auth/mfa";

export function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true, // never accessible to client-side JS — mitigates XSS token theft
    secure: isProduction, // HTTPS-only in production; allows http in local dev
    sameSite: "lax",
    maxAge: FIFTEEN_MINUTES_MS, // keep in sync with JWT_EXPIRES_IN in .env
    path: "/",
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  });
}

export function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: SEVEN_DAYS_MS, // keep in sync with REFRESH_TOKEN_EXPIRES_IN_MS in utils/refreshToken.js
    path: REFRESH_COOKIE_PATH,
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: REFRESH_COOKIE_PATH,
  });
}

export function setCsrfCookie(res, token) {
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // must be readable by frontend JS — see the module comment
    secure: isProduction,
    sameSite: "lax",
    maxAge: SEVEN_DAYS_MS, // lives as long as the session can, refreshed alongside login/refresh
    path: "/",
  });
}

export function clearCsrfCookie(res) {
  res.clearCookie(CSRF_COOKIE_NAME, {
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  });
}

// Set instead of the real auth cookies when a password check succeeds but
// mfaEnabled is true — holds the "who's mid-login" state until the TOTP
// code is verified, without ever putting a usable session token on the
// wire until then. Path-scoped to /api/auth/mfa so it's never sent
// anywhere else, and never lives longer than 5 minutes.
export function setMfaPendingCookie(res, token) {
  res.cookie(MFA_PENDING_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: FIVE_MINUTES_MS,
    path: MFA_PENDING_COOKIE_PATH,
  });
}

export function clearMfaPendingCookie(res) {
  res.clearCookie(MFA_PENDING_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: MFA_PENDING_COOKIE_PATH,
  });
}
