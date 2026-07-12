// Auth service — business logic only. Never touches req/res (that's the
// controller's job) and never calls Prisma directly (that's the
// repository's job) — this layer just orchestrates the two.

import bcrypt from "bcrypt";
import { userRepository } from "../repositories/user.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { signToken } from "../utils/jwt.js";

// 12 is the current recommended minimum for bcrypt (10 was the older
// default) — configurable via env in case infra constraints call for a
// different value later, without a code change.
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

// Strips passwordHash (and anything else sensitive, going forward) before a
// user record is ever handed back toward a controller/response.
function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user; // eslint-disable-line no-unused-vars
  return safeUser;
}

export const authService = {
  async register({ fullName, email, password, phone }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ApiError(409, "An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    let user;
    try {
      user = await userRepository.create({ fullName, email, passwordHash, phone });
    } catch (err) {
      // Covers two edge cases the findByEmail check above can't catch:
      // (1) a race — two requests for the same new email arriving at once,
      // (2) a soft-deleted user whose email is still reserved by the
      //     database's unique constraint even though our queries exclude
      //     soft-deleted rows. Either way, Prisma's error code is P2002.
      if (err.code === "P2002") {
        throw new ApiError(409, "An account with this email already exists");
      }
      throw err;
    }

    // Auto-authenticate immediately after registration, per requirements.
    const token = signToken({ sub: user.id });

    return { user: sanitizeUser(user), token };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);

    // Deliberately identical error for "no such user" and "wrong password" —
    // a different message for each would let an attacker enumerate which
    // emails have accounts.
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = signToken({ sub: user.id });

    return { user: sanitizeUser(user), token };
  },

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return sanitizeUser(user);
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordMatches) {
      throw new ApiError(401, "Current password is incorrect");
    }

    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.updatePassword(userId, newPasswordHash);
  },
};
