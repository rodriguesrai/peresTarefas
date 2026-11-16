import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readSession } from "./session";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "GESTOR" | "COLABORADOR";
  mustChangePassword: boolean;
};

// Lê a sessão e confirma no banco que a pessoa ainda existe e está ativa.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await readSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      mustChangePassword: true,
      sessionVersion: true,
    },
  });
  // Sessão de antes de uma troca de senha não vale mais.
  if (!user || !user.active || user.sessionVersion !== session.sessionVersion) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  };
});

// Toda página protegida passa por aqui. Quem precisa trocar a senha
// é levado para /alterar-senha antes de usar qualquer outra tela.
export async function requireUser(options: { allowPendingPasswordChange?: boolean } = {}): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.mustChangePassword && !options.allowPendingPasswordChange) redirect("/alterar-senha");
  return user;
}

export async function requireGestor(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "GESTOR") redirect("/");
  return user;
}
