// Admin service — business logic only. Never touches req/res (that's the
// controller's job) and never calls Prisma directly (that's the
// repository's job) — this layer just orchestrates the two. Mirrors
// auth.service.js; no register() here since admin accounts are seeded, not
// self-registered (see prisma/seed.js).

import bcrypt from "bcrypt";
import { adminUserRepository } from "../repositories/adminUser.repository.js";
import { adminRefreshTokenRepository } from "../repositories/adminRefreshToken.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { signToken, verifyToken, ADMIN_JWT_SECRET } from "../utils/jwt.js";
import { generateRefreshToken, hashRefreshToken, REFRESH_TOKEN_EXPIRES_IN_MS } from "../utils/refreshToken.js";
import { generateMfaSecret, verifyMfaCode, generateMfaQrCode } from "../utils/mfa.js";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
const MFA_PENDING_EXPIRES_IN = "5m";

// Strips passwordHash and mfaSecret before an admin record is ever handed
// back toward a controller/response. mfaEnabled (just a boolean) stays —
// the frontend needs it to know whether setup is still mandatory.
function sanitizeAdmin(admin) {
  const { passwordHash, mfaSecret, ...safeAdmin } = admin; // eslint-disable-line no-unused-vars
  return safeAdmin;
}

// See auth.service.js's issueTokens — identical reasoning, kept as a
// separate copy rather than a shared helper since the admin realm signs
// with a different secret/repository, consistent with how every other
// admin/customer pair in this codebase stays fully separate.
async function issueTokens(adminId) {
  const accessToken = signToken({ sub: adminId }, ADMIN_JWT_SECRET);

  const rawRefreshToken = generateRefreshToken();
  await adminRefreshTokenRepository.create({
    adminId,
    tokenHash: hashRefreshToken(rawRefreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS),
  });

  return { accessToken, refreshToken: rawRefreshToken };
}

export const adminService = {
  async login({ email, password }) {
    const admin = await adminUserRepository.findByEmail(email);

    // Deliberately identical error for "no such admin" and "wrong
    // password" — a different message for each would let an attacker
    // enumerate which emails have admin accounts.
    if (!admin) {
      throw new ApiError(401, "Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatches) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Record the login, and use the returned row so the response reflects
    // the fresh timestamp rather than the stale pre-login one.
    const updatedAdmin = await adminUserRepository.updateLastLogin(admin.id);

    // Password alone isn't enough once MFA is enabled — hand back a
    // single-purpose "pending" token instead of a real session (see
    // auth.service.js's login for the identical customer-side reasoning).
    // MFA is mandatory for admins (middlewares/admin.middleware.js blocks
    // everything except the setup endpoints until mfaEnabled is true), but
    // *this* branch only fires for an admin who already finished setup —
    // one who hasn't yet still logs in normally and gets redirected into
    // mandatory setup by that middleware instead.
    if (updatedAdmin.mfaEnabled) {
      const mfaPendingToken = signToken({ sub: admin.id, purpose: "mfa" }, ADMIN_JWT_SECRET, MFA_PENDING_EXPIRES_IN);
      return { mfaRequired: true, mfaPendingToken };
    }

    const tokens = await issueTokens(admin.id);

    return { mfaRequired: false, admin: sanitizeAdmin(updatedAdmin), ...tokens };
  },

  async verifyMfaLogin(mfaPendingToken, code) {
    if (!mfaPendingToken) {
      throw new ApiError(401, "Authentication required");
    }

    let payload;
    try {
      payload = verifyToken(mfaPendingToken, ADMIN_JWT_SECRET);
    } catch {
      throw new ApiError(401, "Invalid or expired session");
    }
    if (payload.purpose !== "mfa") {
      throw new ApiError(401, "Invalid or expired session");
    }

    const admin = await adminUserRepository.findById(payload.sub);
    if (!admin || !admin.mfaEnabled) {
      throw new ApiError(401, "Invalid or expired session");
    }

    const isValidCode = await verifyMfaCode(admin.mfaSecret, code);
    if (!isValidCode) {
      throw new ApiError(401, "Invalid verification code");
    }

    const tokens = await issueTokens(admin.id);
    return { admin: sanitizeAdmin(admin), ...tokens };
  },

  // Setup only — deliberately no disableMfaForAdmin. MFA is mandatory for
  // every admin account (middlewares/admin.middleware.js enforces this on
  // every request), so there's intentionally no self-service way to turn
  // it back off once enabled; a lost authenticator device is an
  // operational recovery case, not something exposed here.
  async setupMfa(adminId) {
    const admin = await adminUserRepository.findById(adminId);
    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }

    const secret = generateMfaSecret();
    await adminUserRepository.setMfaSecret(adminId, secret);
    const qrCodeDataUrl = await generateMfaQrCode(secret, admin.email);

    return { secret, qrCodeDataUrl };
  },

  async confirmMfaSetup(adminId, code) {
    const admin = await adminUserRepository.findById(adminId);
    if (!admin || !admin.mfaSecret) {
      throw new ApiError(400, "Start MFA setup before confirming it");
    }

    const isValidCode = await verifyMfaCode(admin.mfaSecret, code);
    if (!isValidCode) {
      throw new ApiError(400, "Invalid verification code");
    }

    await adminUserRepository.confirmMfa(adminId);
  },

  async refresh(rawRefreshToken) {
    if (!rawRefreshToken) {
      throw new ApiError(401, "Authentication required");
    }

    const existing = await adminRefreshTokenRepository.findValid(hashRefreshToken(rawRefreshToken));
    if (!existing) {
      throw new ApiError(401, "Invalid or expired session");
    }

    // Re-check the admin still exists/isn't revoked — same reasoning
    // requireAdmin already applies to the access token: admin revocation
    // must take effect immediately, not just once tokens naturally expire.
    const admin = await adminUserRepository.findById(existing.adminId);
    if (!admin) {
      await adminRefreshTokenRepository.revoke(existing.id);
      throw new ApiError(401, "Invalid or expired session");
    }

    await adminRefreshTokenRepository.revoke(existing.id);
    return issueTokens(existing.adminId);
  },

  async logout(rawRefreshToken) {
    if (rawRefreshToken) {
      await adminRefreshTokenRepository.revokeByHash(hashRefreshToken(rawRefreshToken));
    }
  },

  async getProfile(adminId) {
    const admin = await adminUserRepository.findById(adminId);
    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }

    return sanitizeAdmin(admin);
  },

  async changePassword(adminId, { currentPassword, newPassword }) {
    const admin = await adminUserRepository.findById(adminId);
    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }

    const passwordMatches = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!passwordMatches) {
      throw new ApiError(401, "Current password is incorrect");
    }

    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await adminUserRepository.updatePassword(adminId, newPasswordHash);
  },
};
