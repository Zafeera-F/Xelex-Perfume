// Admin user repository — every Prisma query involving the AdminUser model
// lives here. Services never import prisma directly; they call these
// functions instead, so the actual database access is isolated to a single,
// swappable layer.
//
// Soft-deleted admins (deletedAt not null) are excluded from lookups used
// for authentication — a revoked admin should behave as if the account
// doesn't exist for login/session purposes.
//
// No create() here — this phase seeds the sole bootstrap admin via
// prisma/seed.js (talking to Prisma directly, outside the request
// lifecycle); a create-admin endpoint is out of scope for now.

import prisma from "../config/prisma.js";

export const adminUserRepository = {
  findByEmail(email) {
    return prisma.adminUser.findFirst({ where: { email, deletedAt: null } });
  },

  findById(id) {
    return prisma.adminUser.findFirst({ where: { id, deletedAt: null } });
  },

  updatePassword(id, passwordHash) {
    return prisma.adminUser.update({
      where: { id },
      data: { passwordHash },
    });
  },

  updateLastLogin(id) {
    return prisma.adminUser.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  },

  // Enrollment starts here — the secret is stored, but mfaEnabled stays
  // false until confirmMfa below runs. Mandatory for every admin — see
  // requireAdmin's enforcement in middlewares/admin.middleware.js.
  setMfaSecret(id, mfaSecret) {
    return prisma.adminUser.update({ where: { id }, data: { mfaSecret } });
  },

  confirmMfa(id) {
    return prisma.adminUser.update({ where: { id }, data: { mfaEnabled: true } });
  },

  disableMfa(id) {
    return prisma.adminUser.update({ where: { id }, data: { mfaEnabled: false, mfaSecret: null } });
  },
};
