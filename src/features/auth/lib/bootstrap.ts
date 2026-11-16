import "server-only";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "./password";

export const DEFAULT_ADMIN = {
  name: "Administrador",
  email: "admin@escritorio.local",
  password: "trocar123",
} as const;

// Na primeira execução o banco está vazio: cria um gestor padrão
// que é obrigado a trocar a senha no primeiro acesso.
export async function ensureDefaultAdmin() {
  const count = await prisma.user.count();
  if (count > 0) return;

  await prisma.user.create({
    data: {
      name: DEFAULT_ADMIN.name,
      email: DEFAULT_ADMIN.email,
      passwordHash: await hashPassword(DEFAULT_ADMIN.password),
      role: "GESTOR",
      mustChangePassword: true,
    },
  });
}

// Mostra a dica de primeiro acesso enquanto o admin padrão não trocou a senha.
export async function isFirstAccess(): Promise<boolean> {
  const admin = await prisma.user.findUnique({
    where: { email: DEFAULT_ADMIN.email },
    select: { mustChangePassword: true },
  });
  return admin?.mustChangePassword ?? false;
}
