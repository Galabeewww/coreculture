import { PrismaClient } from "@prisma/client";

/**
 * Inisialisasi Prisma Client Singleton
 * Mencegah multiple instance koneksi database pada mode Next.js hot-reload development.
 */

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
