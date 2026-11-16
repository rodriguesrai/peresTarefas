import "server-only";
import { prisma } from "@/lib/prisma";

// Sem nenhuma pessoa cadastrada, o sistema pede a configuração inicial,
// em que o gestor define o próprio e-mail e senha. Não existe senha padrão.
export async function needsInitialSetup(): Promise<boolean> {
  return (await prisma.user.count()) === 0;
}
