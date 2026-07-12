// Collection repository — every Prisma query involving the Collection
// model lives here. Read-only for now (no admin CRUD yet); only used to
// power the public products list/facets endpoints.

import prisma from "../config/prisma.js";

export const collectionRepository = {
  findAllActive() {
    return prisma.collection.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    });
  },
};
