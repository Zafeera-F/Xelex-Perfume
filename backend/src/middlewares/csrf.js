// requireCsrf — the double-submit cookie pattern. Applied globally (see
// app.js) rather than per-route, so a future mutating endpoint can never
// accidentally ship without CSRF protection by a route author forgetting
// to add it.
//
// Why this instead of `csurf`: the checklist this was built against names
// csurf, but it's been unmaintained/deprecated by its own maintainers for
// a few years (known design issues) — double-submit is the current
// standard replacement, and needs no server-side session storage.
//
// How it works: xelex_csrf / xelex_admin_csrf are set alongside the auth
// cookies (utils/cookies.js, utils/adminCookies.js) but deliberately NOT
// httpOnly, so frontend JS can read the value and echo it back as an
// X-CSRF-Token header (src/lib/api.js does this automatically for every
// mutating request). A cross-site attacker's forged request rides the
// cookie along automatically (that's what CSRF exploits), but can't read
// document.cookie on this origin to also set a matching header — so the
// two will never match on a forged request, only on one this app's own
// frontend actually made.

import { ApiError } from "../utils/ApiError.js";
import { CSRF_COOKIE_NAME } from "../utils/cookies.js";
import { ADMIN_CSRF_COOKIE_NAME } from "../utils/adminCookies.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// No CSRF cookie exists yet at login/register/mfa-login-verify (the CSRF
// cookie is only set once a real session is actually issued — mid-MFA-login
// there's only the short-lived pending cookie), refresh/logout exchange or
// tear down tokens rather than mutate data on the user's behalf (and
// logout must always be callable even without a matching CSRF cookie, so
// a stuck session can still be cleared), and the Razorpay webhook is a
// server-to-server call with no browser/cookie involved — it's already
// authenticated by its own HMAC signature (see payment.service.js).
// mfa/setup, mfa/verify-setup, and mfa/disable are deliberately NOT
// excluded — those mutate an already-authenticated session and get the
// same CSRF protection as everything else.
//
// /api/newsletter/subscribe is also excluded — it's a public, unauthenticated
// mutation with no session/CSRF cookie to have been issued yet (the CSRF
// cookie is only ever set alongside a real login/register/MFA-verify), same
// reasoning as the auth routes above.
const EXCLUDED_PATTERNS = [
  /^\/api\/auth\/(login|register|refresh|logout|mfa\/login-verify)$/,
  /^\/api\/admin\/auth\/(login|refresh|logout|mfa\/login-verify)$/,
  /^\/api\/payments\/razorpay\/webhook$/,
  /^\/api\/newsletter\/subscribe$/,
];

export function requireCsrf(req, res, next) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }
  if (EXCLUDED_PATTERNS.some((pattern) => pattern.test(req.path))) {
    return next();
  }

  const isAdminRealm = req.path.startsWith("/api/admin/");
  const cookieName = isAdminRealm ? ADMIN_CSRF_COOKIE_NAME : CSRF_COOKIE_NAME;
  const cookieValue = req.cookies?.[cookieName];
  const headerValue = req.get("X-CSRF-Token");

  if (!cookieValue || !headerValue || cookieValue !== headerValue) {
    return next(new ApiError(403, "Invalid or missing CSRF token"));
  }

  next();
}
