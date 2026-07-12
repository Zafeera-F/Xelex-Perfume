// Admin service — business logic only. Never touches req/res (that's the
// controller's job) and never calls Prisma directly (that's the
// repository's job) — this layer just orchestrates the two. Mirrors
// auth.service.js; no register() here since admin accounts are seeded, not
// self-registered (see prisma/seed.js).

import bcrypt from "bcrypt";
import { adminUserRepository } from "../repositories/adminUser.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { signToken, ADMIN_JWT_SECRET } from "../utils/jwt.js";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

// Strips passwordHash before an admin record is ever handed back toward a
// controller/response.
function sanitizeAdmin(admin) {
  const { passwordHash, ...safeAdmin } = admin; // eslint-disable-line no-unused-vars
  return safeAdmin;
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

    const token = signToken({ sub: admin.id }, ADMIN_JWT_SECRET);

    return { admin: sanitizeAdmin(updatedAdmin), token };
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
