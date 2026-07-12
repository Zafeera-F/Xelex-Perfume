// Admin refresh token repository — AdminRefreshToken's counterpart to
// refreshToken.repository.js. Kept as a fully separate file/table rather
// than a shared one, same realm-isolation reasoning as everything else
// admin-related in this codebase.

import prisma from "../config/prisma.js";

export const adminRefreshTokenRepository = {
  create({ adminId, tokenHash, expiresAt }, client = prisma) {
    return client.adminRefreshToken.create({ data: { adminId, tokenHash, expiresAt } });
  },

  findValid(tokenHash, client = prisma) {
    return client.adminRefreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    });
  },

  revoke(id, client = prisma) {
    return client.adminRefreshToken.update({ where: { id }, data: { revokedAt: new Date() } });
  },

  async revokeByHash(tokenHash, client = prisma) {
    await client.adminRefreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
};
