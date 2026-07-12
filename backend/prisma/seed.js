// Bootstrap seed — sets up the one SUPER_ADMIN account and the reference
// catalog data (categories, collections, products) a fresh database needs
// to be usable. Standalone script outside the Express request lifecycle (no
// controller/service involved), so it talks to Prisma directly rather than
// going through the repositories.
//
// Run via: npm run prisma:seed — safe to re-run any time (see per-section
// notes below on how each part stays idempotent).

import bcrypt from "bcrypt";
import prisma from "../src/config/prisma.js";
import { CATEGORY_NAMES, COLLECTION_NAMES, CATALOG } from "./seedData.js";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

const slugify = (name) => name.toLowerCase().trim().replace(/\s+/g, "-");

// Safe to re-run: upserts by the unique `email` column. Re-running with the
// same ADMIN_EMAIL refreshes fullName/passwordHash/role and clears
// deletedAt — an operator intentionally re-running this script with new env
// values is treated as "reset/restore this admin," which also doubles as a
// recovery path if the bootstrap admin was ever soft-deleted.
async function seedAdmin() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FULL_NAME } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_FULL_NAME) {
    // Fail loudly, same posture as jwt.js's missing-secret checks — a
    // half-configured bootstrap silently doing nothing is worse than a
    // crash with a clear message.
    throw new Error(
      "ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_FULL_NAME must be set in the environment to run the seed script."
    );
  }

  // Same strength bar as the API's own change-password validator (see
  // admin.validator.js) — a seeded admin shouldn't be held to a lower
  // standard than one who changes their password through the app.
  const STRONG_PASSWORD_RE = /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/;
  if (!STRONG_PASSWORD_RE.test(ADMIN_PASSWORD)) {
    throw new Error(
      "ADMIN_PASSWORD does not meet strength requirements (min 8 characters, at least one uppercase letter, at least one number)."
    );
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

  const admin = await prisma.adminUser.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      fullName: ADMIN_FULL_NAME,
      passwordHash,
      role: "SUPER_ADMIN",
      deletedAt: null,
    },
    create: {
      fullName: ADMIN_FULL_NAME,
      email: ADMIN_EMAIL,
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  console.log(`Seeded SUPER_ADMIN: ${admin.email}`);
}

// Safe to re-run: categories/collections upsert by their unique `name`,
// products upsert by their unique `slug`. Each product's images are
// replaced wholesale (deleteMany + createMany) rather than diffed, since
// there's no stable identity for an individual placeholder image row to
// upsert against — simplest correct approach for reference/demo data.
async function seedCatalog() {
  const categoryByName = {};
  for (const name of CATEGORY_NAMES) {
    categoryByName[name] = await prisma.category.upsert({
      where: { name },
      update: { deletedAt: null },
      create: { name, slug: slugify(name) },
    });
  }

  const collectionByName = {};
  for (const name of COLLECTION_NAMES) {
    collectionByName[name] = await prisma.collection.upsert({
      where: { name },
      update: { deletedAt: null },
      create: { name, slug: slugify(name) },
    });
  }

  for (const item of CATALOG) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId: categoryByName[item.categoryName].id,
        collectionId: collectionByName[item.collectionName].id,
        brandLine: item.brandLine,
        badge: item.badge,
        ratingAverage: item.ratingAverage,
        ratingCount: item.ratingCount,
        stockQuantity: item.stockQuantity,
        isActive: true,
        isFeatured: item.isFeatured,
        isBestSeller: item.isBestSeller,
        deletedAt: null,
      },
      create: {
        slug: item.slug,
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId: categoryByName[item.categoryName].id,
        collectionId: collectionByName[item.collectionName].id,
        brandLine: item.brandLine,
        badge: item.badge,
        ratingAverage: item.ratingAverage,
        ratingCount: item.ratingCount,
        stockQuantity: item.stockQuantity,
        isFeatured: item.isFeatured,
        isBestSeller: item.isBestSeller,
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: item.images.map((img) => ({ ...img, productId: product.id })),
    });
  }

  console.log(`Seeded catalog: ${CATEGORY_NAMES.length} categories, ${COLLECTION_NAMES.length} collections, ${CATALOG.length} products.`);
}

async function main() {
  await seedAdmin();
  await seedCatalog();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
