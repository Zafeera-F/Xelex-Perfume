// PhoneOtp repository — every Prisma query involving the PhoneOtp model
// lives here.

import prisma from "../config/prisma.js";

export const phoneOtpRepository = {
  findLatestByPhone(phone) {
    return prisma.phoneOtp.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    });
  },

  create({ phone, codeHash, expiresAt }) {
    return prisma.phoneOtp.create({ data: { phone, codeHash, expiresAt } });
  },

  incrementAttempts(id) {
    return prisma.phoneOtp.update({ where: { id }, data: { attempts: { increment: 1 } } });
  },

  markConsumed(id) {
    return prisma.phoneOtp.update({ where: { id }, data: { consumedAt: new Date() } });
  },
};
