import "server-only";
import { prisma } from "@/lib/prisma";

export type PersonListItem = {
  id: string;
  name: string;
  email: string;
  position: string | null;
  role: "GESTOR" | "COLABORADOR";
  active: boolean;
  openTasks: number;
};

// Ativos primeiro, depois por nome. Conta as tarefas ainda não concluídas.
export async function listPeople(): Promise<PersonListItem[]> {
  const people = await prisma.user.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      position: true,
      role: true,
      active: true,
      _count: { select: { assignedTasks: { where: { status: { not: "CONCLUIDA" } } } } },
    },
  });

  return people.map(({ _count, ...person }) => ({ ...person, openTasks: _count.assignedTasks }));
}

export async function getPerson(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, position: true, role: true, active: true },
  });
}
