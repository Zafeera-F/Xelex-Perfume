// Thin fetch wrapper — the one place that knows the API's base URL, sends
// credentials (the httpOnly auth cookie) on every request, and normalizes
// the backend's { success, message, data } / { success, message, errors }
// response shape into either a resolved value or a thrown ApiClientError.
// Every feature (auth today, products/cart/orders later) calls apiRequest()
// instead of using fetch() directly, so this behavior never has to be
// re-implemented per feature.
//
// Access tokens are short-lived (15 min — see backend/src/utils/jwt.js) by
// design, so a 401 here doesn't necessarily mean "log the user out": it
// usually just means the access token expired and a new one can be minted
// silently from the refresh cookie. This wrapper handles that transparently
// — callers never need to know tokens refresh at all.

// Vercel's env var UI won't accept a saved-but-empty value, so rather than
// relying on an explicitly-blank VITE_API_URL, an unset one now defaults to
// relative URLs in any production build (import.meta.env.PROD) — exactly
// what the Vercel-proxy deployment setup needs (see vercel.json), without
// requiring VITE_API_URL to be set on Vercel at all. Local dev is
// unaffected: VITE_API_URL is explicitly set in .env there.
const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:5000");

export class ApiClientError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors; // field-level validation errors: [{ field, message }]
  }
}

// Paths that must never trigger (or be treated as) a refresh-and-retry:
// login/register have no session yet to refresh, refresh is the mechanism
// itself (retrying it would loop), logout is about to tear the session
// down anyway, and mfa/login-verify authenticates via the short-lived
// mfa-pending cookie rather than the access token, so a 401 there means
// "wrong code," not "expired token" — there's no access token to refresh.
const NO_REFRESH_PATTERN = /\/auth\/(login|register|refresh|logout|mfa\/login-verify)$/;

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Concurrent 401s (e.g. several components fetching on mount) must only
// trigger one actual refresh call each — every caller awaits the same
// in-flight promise instead of racing separate refresh requests. Customer
// and admin realms refresh independently, hence one slot per realm.
const refreshPromises = { customer: null, admin: null };

function realmFor(path) {
  return path.startsWith("/api/admin/") ? "admin" : "customer";
}

function refreshEndpointFor(realm) {
  return realm === "admin" ? "/api/admin/auth/refresh" : "/api/auth/refresh";
}

async function attemptRefresh(realm) {
  if (!refreshPromises[realm]) {
    refreshPromises[realm] = fetch(`${BASE_URL}${refreshEndpointFor(realm)}`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromises[realm] = null;
      });
  }
  return refreshPromises[realm];
}

// Reads a single cookie's value — xelex_csrf / xelex_admin_csrf are
// deliberately NOT httpOnly (see backend/src/utils/cookies.js) precisely
// so this can read them; the CSRF protection comes from a cross-site
// attacker being unable to do the same on this origin, not from secrecy
// of the value itself.
function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function csrfCookieNameFor(realm) {
  return realm === "admin" ? "xelex_admin_csrf" : "xelex_csrf";
}

export async function apiRequest(path, { method = "GET", body, _isRetry = false, ...rest } = {}) {
  // FormData (file uploads) must be sent as-is — the browser sets its own
  // multipart Content-Type with boundary; JSON.stringify-ing it would
  // silently send "[object FormData]" instead of the file.
  const isFormData = body instanceof FormData;

  const headers = body && !isFormData ? { "Content-Type": "application/json" } : {};
  if (MUTATING_METHODS.has(method)) {
    const csrfToken = readCookie(csrfCookieNameFor(realmFor(path)));
    if (csrfToken) headers["X-CSRF-Token"] = csrfToken;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: "include", // send/receive the httpOnly auth cookie cross-origin
    headers: Object.keys(headers).length ? headers : undefined,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (response.status === 401 && !_isRetry && !NO_REFRESH_PATTERN.test(path)) {
    const refreshed = await attemptRefresh(realmFor(path));
    if (refreshed) {
      return apiRequest(path, { method, body, _isRetry: true, ...rest });
    }
  }

  // 204/logout-style empty responses aside, the API always returns JSON —
  // including on errors — so we can parse first and branch on `success`.
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    const message = payload?.message || "Something went wrong. Please try again.";
    throw new ApiClientError(message, response.status, payload?.errors || []);
  }

  return payload.data;
}
