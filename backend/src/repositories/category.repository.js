// Category repository — every Prisma query involving the Category model
// lives here. Read-only for now (no admin CRUD yet); only used to power the
// public products list/facets endpoints.

import prisma from "../config/prisma.js";

export const categoryRepository = {
  findAllActive() {
    return prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    });
  },
};
