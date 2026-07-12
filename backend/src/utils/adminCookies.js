// Admin auth cookie helpers — the admin equivalent of cookies.js. A
// distinct cookie name from the customer session (`xelex_token`) is what
// lets a customer and an admin be logged into the same browser at once
// without either session clobbering the other.

export const ADMIN_AUTH_COOKIE_NAME = "xelex_admin_token";

const isProduction = process.env.NODE_ENV === "production";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function setAdminAuthCookie(res, token) {
  res.cookie(ADMIN_AUTH_COOKIE_NAME, token, {
    httpOnly: true, // never accessible to client-side JS — mitigates XSS token theft
    secure: isProduction, // HTTPS-only in production; allows http in local dev
    sameSite: "lax",
    maxAge: SEVEN_DAYS_MS, // keep in sync with JWT_EXPIRES_IN in .env
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
