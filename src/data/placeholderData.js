// SECTION IMAGE REGISTRY
// ---------------------------------------------------------------------------
// Non-product image URLs used on the homepage (hero, story section). Product
// photography now lives in the database (ProductImage rows, seeded via
// backend/prisma/seedData.js) and is served through the products API —
// these are the only images that still don't belong to any product.

export const SECTION_IMAGES = {
  hero: "/hero-product.jpg",
  story: "/story-boutique.jpg",
};
