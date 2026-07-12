// Admin auth cookie helpers — the admin equivalent of cookies.js. A
// distinct cookie name from the customer session (`xelex_token`) is what
// lets a customer and an admin be logged into the same browser at once
// without either session clobbering the other. See cookies.js for why the
// refresh cookie's path is scoped narrower than the access cookie's.

export const ADMIN_AUTH_COOKIE_NAME = "xelex_admin_token";
export const ADMIN_REFRESH_COOKIE_NAME = "xelex_admin_refresh_token";
export const ADMIN_CSRF_COOKIE_NAME = "xelex_admin_csrf";
export const ADMIN_MFA_PENDING_COOKIE_NAME = "xelex_admin_mfa_pending";

const isProduction = process.env.NODE_ENV === "production";
const FIVE_MINUTES_MS = 5 * 60 * 1000;
const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const ADMIN_REFRESH_COOKIE_PATH = "/api/admin/auth";
const ADMIN_MFA_PENDING_COOKIE_PATH = "/api/admin/auth/mfa";

export function setAdminAuthCookie(res, token) {
  res.cookie(ADMIN_AUTH_COOKIE_NAME, token, {
    httpOnly: true, // never accessible to client-side JS — mitigates XSS token theft
    secure: isProduction, // HTTPS-only in production; allows http in local dev
    sameSite: "lax",
    maxAge: FIFTEEN_MINUTES_MS, // keep in sync with JWT_EXPIRES_IN in .env
    path: "/",
  });
}

export function clearAdminAuthCookie(res) {
  res.clearCookie(ADMIN_AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  });
}

export function setAdminRefreshCookie(res, token) {
  res.cookie(ADMIN_REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: SEVEN_DAYS_MS, // keep in sync with REFRESH_TOKEN_EXPIRES_IN_MS in utils/refreshToken.js
    path: ADMIN_REFRESH_COOKIE_PATH,
  });
}

export function clearAdminRefreshCookie(res) {
  res.clearCookie(ADMIN_REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: ADMIN_REFRESH_COOKIE_PATH,
  });
}

export function setAdminCsrfCookie(res, token) {
  res.cookie(ADMIN_CSRF_COOKIE_NAME, token, {
    httpOnly: false, // must be readable by frontend JS — double-submit pattern, see middlewares/csrf.js
    secure: isProduction,
    sameSite: "lax",
    maxAge: SEVEN_DAYS_MS,
    path: "/",
  });
}

export function clearAdminCsrfCookie(res) {
  res.clearCookie(ADMIN_CSRF_COOKIE_NAME, {
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  });
}

export function setAdminMfaPendingCookie(res, token) {
  res.cookie(ADMIN_MFA_PENDING_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: FIVE_MINUTES_MS,
    path: ADMIN_MFA_PENDING_COOKIE_PATH,
  });
}

export function clearAdminMfaPendingCookie(res) {
  res.clearCookie(ADMIN_MFA_PENDING_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: ADMIN_MFA_PENDING_COOKIE_PATH,
  });
}
