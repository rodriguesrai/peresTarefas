import { defineConfig } from "prisma/config";

// O banco fica em ./dados por padrão, sem precisar de arquivo .env.
export const DEFAULT_DATABASE_URL = "file:./dados/peres-tarefas.db";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
  },
});
