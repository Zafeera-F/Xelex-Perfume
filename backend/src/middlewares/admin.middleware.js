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

// MFA is mandatory for every admin (the security checklist this was built
// against calls this out explicitly) — enforced here, not just in the
// frontend, per "never rely on the frontend to hide admin features." An
// admin who hasn't finished enrollment can only reach the handful of
// routes enrollment itself needs: seeing who they are, finishing setup,
// or logging out. Everything else is blocked with a distinguishable error
// (errors: [{ field: "mfa" }]) so the frontend can redirect into the
// mandatory setup flow instead of showing a generic "not authorized."
const MFA_SETUP_ALLOWED_PATHS = new Set([
  "/api/admin/auth/profile",
  "/api/admin/auth/logout",
  "/api/admin/auth/mfa/setup",
  "/api/admin/auth/mfa/verify-setup",
]);

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

  // req.path here is relative to whichever router mounted requireAdmin
  // (e.g. "/profile", not "/api/admin/auth/profile") since this runs as
  // route-level middleware inside several differently-mounted routers —
  // req.originalUrl is always the full, absolute path regardless of
  // nesting, which is what the allowlist above is written in terms of.
  const requestPath = req.originalUrl.split("?")[0];
  if (!admin.mfaEnabled && !MFA_SETUP_ALLOWED_PATHS.has(requestPath)) {
    return next(
      new ApiError(403, "Two-factor authentication setup is required before you can continue", [
        { field: "mfa", message: "setup_required" },
      ])
    );
  }

  req.admin = { id: admin.id, role: admin.role };
  next();
}

// requireRole — layers on top of requireAdmin (must run after it, since it
// reads req.admin.role). Applied only to the actions where getting it
// wrong is genuinely destructive — currently that's deleting products and
// reviews. STAFF can still view/create/edit everything; MANAGER and
// SUPER_ADMIN can also delete. Not a general permissions matrix — extend
// this policy deliberately as new destructive actions are added, rather
// than gating everything up front.
export function requireRole(...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.admin.role)) {
      return next(new ApiError(403, "You don't have permission to perform this action"));
    }
    next();
  };
}
