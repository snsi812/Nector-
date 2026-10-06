import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient across the app (and across hot reloads in dev).
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
