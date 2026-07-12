// Order repository — every Prisma query involving the Order model lives
// here. `countCreatedToday` and `create` take an optional Prisma client so
// order creation can run them inside a single transaction (see
// order.service.js) — a stock shortfall or an order-number collision rolls
// back everything instead of leaving a partial order behind. The
// "ForAdmin" methods below see every order across every customer, unlike
// `findAllByUser`.

import prisma from "../config/prisma.js";

export const orderRepository = {
  countCreatedToday(client = prisma) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return client.order.count({ where: { createdAt: { gte: startOfDay } } });
  },

  create(data, client = prisma) {
    return client.order.create({
      data,
      include: { items: true, address: true, payment: true },
    });
  },

  async findAllByUser(userId) {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        orderNumber: true,
        status: true,
        total: true,
        paymentMethod: true,
        createdAt: true,
        items: { select: { quantity: true } },
      },
    });

    // Flatten item rows into a single itemCount (total quantity, not line
    // count) — more meaningful to a customer glancing at their order history.
    return orders.map(({ items, ...order }) => ({
      ...order,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    }));
  },

  // --- Admin-facing methods (every order, not just one user's) ----------

  async findAllForAdmin({ page = 1, pageSize = 10, status, search } = {}) {
    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: "insensitive" } },
          { user: { fullName: { contains: search, mode: "insensitive" } } },
          { user: { phone: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const [rows, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          paymentMethod: true,
          createdAt: true,
          user: { select: { fullName: true, email: true } },
          payment: { select: { status: true } },
          items: { select: { quantity: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const items = rows.map(({ items: lineItems, user, payment, ...order }) => ({
      ...order,
      customerName: user.fullName,
      customerEmail: user.email,
      paymentStatus: payment?.status ?? null,
      itemCount: lineItems.reduce((sum, item) => sum + item.quantity, 0),
    }));

    return { items, total };
  },

  findByIdForAdmin(id) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        address: true,
        payment: true,
        user: { select: { fullName: true, email: true, phone: true } },
      },
    });
  },

  // Optional `client` param lets adminOrder.service.js call this inside a
  // transaction (see restoreStockForOrder there) — defaults to the
  // singleton so every existing call site is unaffected.
  updateStatus(id, status, client = prisma) {
    return client.order.update({ where: { id }, data: { status } });
  },

  // Generic count, used by the admin dashboard — no filter for "Total
  // Orders", a status filter for "Pending"/"Delivered".
  count({ status } = {}) {
    return prisma.order.count({ where: status ? { status } : {} });
  },
};
