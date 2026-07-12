// Prisma Client — single shared instance
// -----------------------------------------------------------------------------
// Every future route/controller imports `prisma` from here rather than doing
// `new PrismaClient()` itself. A PrismaClient manages its own connection
// pool, so creating multiple instances across the app (or a new one per
// request) exhausts the database's available connections under load.
//
// The globalThis cache is specifically to survive dev-mode hot-reloading
// (nodemon / node --watch): without it, every file reload would create a
// brand new PrismaClient while the old one's connections linger, quickly
// hitting Postgres's connection limit during local development.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
