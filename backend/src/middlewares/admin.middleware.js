// requireAdmin — protects an admin route by verifying the JWT stored in the
// admin auth cookie, signed with the admin-only secret. Deliberately
// deviates from requireAuth (customer) by re-checking the database on every
// request rather than trusting the JWT payload alone: deletedAt is the only
// way to revoke admin access, and admin tokens are as long-lived as
// customer tokens, so without this check a revoked admin would keep working
// for up to JWT_EXPIRES_IN after revocation. Admins hold higher-privilege,
// more destructive powers than customers, so immediate revocation matters
// more here — the cost is one cheap indexed lookup on low-volume traffic.

import { verifyToken, ADMIN_JWT_SECRET } from "../utils/jwt.js";
import { ADMIN_AUTH_COOKIE_NAME } from "../utils/adminCookies.js";
import { adminUserRepository } from "../repositories/adminUser.repository.js";
import { ApiError } from "../utils/ApiError.js";

export async function requireAdmin(req, res, next) {
  const token = req.cookies?.[ADMIN_AUTH_COOKIE_NAME];

  if (!token) {
    return next(new ApiError(401, "Authentication required"));
  }

  let payload;
  try {
    payload = verifyToken(token, ADMIN_JWT_SECRET);
  } catch {
    // Covers both JsonWebTokenError (invalid/tampered token) and
    // TokenExpiredError (expired token) — both are just "not authenticated"
    // from the client's point of view.
    return next(new ApiError(401, "Invalid or expired session"));
  }

  const admin = await adminUserRepository.findById(payload.sub);
  if (!admin) {
    return next(new ApiError(401, "Invalid or expired session"));
  }

  // role is attached now as a hook for a future requireRole() middleware —
  // no route uses it yet.
  req.admin = { id: admin.id, role: admin.role };
  next();
}
