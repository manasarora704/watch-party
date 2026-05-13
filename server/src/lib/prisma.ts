import { PrismaClient } from "@prisma/client";

declare global {
  var __watchioPrisma: PrismaClient | undefined;
}

export const prisma = globalThis.__watchioPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__watchioPrisma = prisma;
}
