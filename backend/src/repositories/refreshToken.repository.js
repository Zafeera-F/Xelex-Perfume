// Refresh token repository — every Prisma query involving the
// RefreshToken model lives here. Only ever stores/looks up hashes, never
// the raw token — see utils/refreshToken.js.

import prisma from "../config/prisma.js";

export const refreshTokenRepository = {
  create({ userId, tokenHash, expiresAt }, client = prisma) {
    return client.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
  },

  // A token is usable only if its hash matches, it hasn't expired, and it
  // hasn't already been revoked (by a prior rotation, logout, or reuse).
  findValid(tokenHash, client = prisma) {
    return client.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    });
  },

  revoke(id, client = prisma) {
    return client.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } });
  },

  // Logout doesn't have the row's id on hand, only the raw cookie value
  // (already hashed by the caller) — revoke by hash directly. A no-op if
  // the hash doesn't match anything (already expired/revoked/never valid),
  // which is fine — logout's job is just "make sure this token can't be
  // used again," and it already can't be.
  async revokeByHash(tokenHash, client = prisma) {
    await client.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
};
