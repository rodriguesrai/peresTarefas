import "server-only";
import fs from "node:fs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";
import { DATA_DIR, DATABASE_FILE } from "./paths";

function createClient() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? `file:${DATABASE_FILE}`,
  });
  return new PrismaClient({ adapter });
}

// Reaproveita a mesma conexão entre recarregamentos em desenvolvimento.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
