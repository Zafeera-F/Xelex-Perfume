// User repository — every Prisma query involving the User model lives here.
// Services never import prisma directly; they call these functions instead,
// so the actual database access is isolated to a single, swappable layer.
//
// Soft-deleted users (deletedAt not null) are excluded from lookups used for
// authentication — a "deleted" account should behave as if it doesn't exist
// for login/register purposes, freeing up its email for reuse.

import prisma from "../config/prisma.js";

export const userRepository = {
  findByEmail(email) {
    return prisma.user.findFirst({ where: { email, deletedAt: null } });
  },

  findById(id) {
    return prisma.user.findFirst({ where: { id, deletedAt: null } });
  },

  create({ fullName, email, passwordHash, phone }) {
    return prisma.user.create({
      data: { fullName, email, passwordHash, phone },
    });
  },

  updatePassword(id, passwordHash) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  },
};
