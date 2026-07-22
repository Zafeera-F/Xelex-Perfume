// HeroSlide repository — every Prisma query involving the HeroSlide model
// lives here.

import prisma from "../config/prisma.js";

export const heroSlideRepository = {
  findAllEnabled() {
    return prisma.heroSlide.findMany({
      where: { isEnabled: true },
      orderBy: { sortOrder: "asc" },
    });
  },

  findAllForAdmin() {
    return prisma.heroSlide.findMany({ orderBy: { sortOrder: "asc" } });
  },

  findById(id) {
    return prisma.heroSlide.findUnique({ where: { id } });
  },

  create(data) {
    return prisma.heroSlide.create({ data });
  },

  update(id, data) {
    return prisma.heroSlide.update({ where: { id }, data });
  },

  delete(id) {
    return prisma.heroSlide.delete({ where: { id } });
  },

  // Sets sortOrder to each id's position in the given array — same
  // "recompute the whole ordering in one go" approach as
  // product.repository.js's replaceImages.
  reorder(orderedIds) {
    return prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.heroSlide.update({ where: { id }, data: { sortOrder: index } })
      )
    );
  },
};
