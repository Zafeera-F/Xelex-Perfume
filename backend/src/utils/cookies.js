// Auth cookie helpers — the only place that knows the cookie's name and
// options. Login, register, and logout all go through these two functions
// so the cookie config (httpOnly, secure, sameSite, maxAge) can never drift
// between where it's set and where it's cleared.

export const AUTH_COOKIE_NAME = "xelex_token";

const isProduction = process.env.NODE_ENV === "production";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true, // never accessible to client-side JS — mitigates XSS token theft
    secure: isProduction, // HTTPS-only in production; allows http in local dev
    sameSite: "lax",
    maxAge: SEVEN_DAYS_MS, // keep in sync with JWT_EXPIRES_IN in .env
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
