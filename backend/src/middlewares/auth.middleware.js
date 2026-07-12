// requireAuth — protects a route by verifying the JWT stored in the
// httpOnly auth cookie. On success, attaches { id } to req.user for
// downstream controllers/services to use. Rejects with 401 if the cookie
// is missing, the token is invalid, or the token has expired.

import { verifyToken } from "../utils/jwt.js";
import { AUTH_COOKIE_NAME } from "../utils/cookies.js";
import { ApiError } from "../utils/ApiError.js";

export function requireAuth(req, res, next) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    return next(new ApiError(401, "Authentication required"));
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub };
    next();
  } catch {
    // Covers both JsonWebTokenError (invalid/tampered token) and
    // TokenExpiredError (expired token) — both are just "not authenticated"
    // from the client's point of view.
    next(new ApiError(401, "Invalid or expired session"));
  }
}
