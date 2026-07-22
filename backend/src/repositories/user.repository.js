// User repository — every Prisma query involving the User model lives here.
// Services never import prisma directly; they call these functions instead,
// so the actual database access is isolated to a single, swappable layer.
//
// Soft-deleted users (deletedAt not null) are excluded from lookups used for
// authentication — a "deleted" account should behave as if it doesn't exist
// for login/register purposes, freeing up its email for reuse. The
// "ForAdmin" methods below are the exception — admin customer management
// deliberately sees deactivated accounts too, same reasoning as
// product.repository.js's admin methods.

import prisma from "../config/prisma.js";

export const userRepository = {
  findByEmail(email) {
    return prisma.user.findFirst({ where: { email, deletedAt: null } });
  },

  findById(id) {
    return prisma.user.findFirst({ where: { id, deletedAt: null } });
  },

  findByPhone(phone) {
    return prisma.user.findFirst({ where: { phone, deletedAt: null } });
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

  // Only defined/non-undefined fields ever reach here (see
  // auth.service.js's updateProfile), so this naturally supports a partial
  // update of fullName/email/phone.
  updateProfile(id, fields) {
    return prisma.user.update({ where: { id }, data: fields });
  },

  // Enrollment starts here — the secret is stored, but mfaEnabled stays
  // false (see the schema comment) until confirmMfa below runs.
  setMfaSecret(id, mfaSecret) {
    return prisma.user.update({ where: { id }, data: { mfaSecret } });
  },

  confirmMfa(id) {
    return prisma.user.update({ where: { id }, data: { mfaEnabled: true } });
  },

  disableMfa(id) {
    return prisma.user.update({ where: { id }, data: { mfaEnabled: false, mfaSecret: null } });
  },

  // --- Admin-facing methods (every customer, plus dashboard aggregates) -

  count() {
    return prisma.user.count({ where: { deletedAt: null } });
  },

  async findAllForAdmin({ page = 1, pageSize = 10, search } = {}) {
    const where = {
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          createdAt: true,
          deletedAt: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const items = rows.map(({ _count, ...user }) => ({ ...user, orderCount: _count.orders }));
    return { items, total };
  },

  findByIdForAdmin(id) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, fullName: true, email: true, phone: true, createdAt: true, deletedAt: true },
    });
  },
};
