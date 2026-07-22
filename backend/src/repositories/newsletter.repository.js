// Newsletter repository — every Prisma query involving the
// NewsletterSubscriber model lives here.

import prisma from "../config/prisma.js";

export const newsletterRepository = {
  // Upsert handles both a brand-new subscriber and someone re-subscribing
  // after previously unsubscribing (clearing unsubscribedAt) in one call —
  // no P2002 handling needed anywhere upstream.
  subscribe(email) {
    return prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { unsubscribedAt: null },
      create: { email },
    });
  },

  async findAllForAdmin({ page = 1, pageSize = 10, search } = {}) {
    const where = search ? { email: { contains: search, mode: "insensitive" } } : {};

    const [items, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { subscribedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.newsletterSubscriber.count({ where }),
    ]);

    return { items, total };
  },
};
