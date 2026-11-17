import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { TaskPriority, TaskStatus } from "@/generated/prisma/enums";
import { PRIORITIES, PRIORITY_RANK, STATUSES, startOfTodayUtc } from "./task-meta";

export type TaskFilters = {
  assigneeId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  overdue?: boolean;
  // Por padrão as concluídas ficam de fora, para a lista mostrar o que falta fazer.
  includeDone?: boolean;
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// Converte a URL (?status=...&prioridade=...) em filtros válidos; o resto é ignorado.
export function parseTaskFilters(params: SearchParams): TaskFilters {
  const status = first(params.status);
  const priority = first(params.prioridade);
  return {
    assigneeId: first(params.responsavel) || undefined,
    status: STATUSES.includes(status as TaskStatus) ? (status as TaskStatus) : undefined,
    priority: PRIORITIES.includes(priority as TaskPriority) ? (priority as TaskPriority) : undefined,
    overdue: first(params.atrasadas) === "1",
    includeDone: first(params.concluidas) === "1" || status === "CONCLUIDA",
  };
}

export type TaskListItem = Prisma.TaskGetPayload<{
  include: { assignee: { select: { id: true; name: true } }; _count: { select: { notes: true } } };
}>;

export async function listTasks(filters: TaskFilters): Promise<TaskListItem[]> {
  const where: Prisma.TaskWhereInput = {
    assigneeId: filters.assigneeId,
    priority: filters.priority,
    status: filters.status ?? (filters.includeDone ? undefined : { not: "CONCLUIDA" }),
  };
  if (filters.overdue) {
    where.dueDate = { lt: startOfTodayUtc() };
    where.status = filters.status && filters.status !== "CONCLUIDA" ? filters.status : { not: "CONCLUIDA" };
  }

  const tasks = await prisma.task.findMany({
    where,
    include: { assignee: { select: { id: true, name: true } }, _count: { select: { notes: true } } },
    orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
  });

  // Mesmo prazo: a mais urgente primeiro. Concluídas vão para o fim.
  return tasks.sort((a, b) => {
    const doneA = a.status === "CONCLUIDA" ? 1 : 0;
    const doneB = b.status === "CONCLUIDA" ? 1 : 0;
    if (doneA !== doneB) return doneA - doneB;
    const dueA = a.dueDate?.getTime() ?? Infinity;
    const dueB = b.dueDate?.getTime() ?? Infinity;
    if (dueA !== dueB) return dueA - dueB;
    return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  });
}

export async function listAssignablePeople() {
  return prisma.user.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

// Colaborador só enxerga as próprias tarefas; gestor enxerga todas.
export async function getTaskForUser(id: string, user: { id: string; role: "GESTOR" | "COLABORADOR" }) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignee: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });
  if (!task) return null;
  if (user.role !== "GESTOR" && task.assigneeId !== user.id) return null;
  return task;
}

export async function listTaskNotes(taskId: string) {
  return prisma.taskNote.findMany({
    where: { taskId },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, name: true } } },
  });
}
