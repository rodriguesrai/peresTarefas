import type { TaskPriority, TaskStatus } from "@/generated/prisma/enums";

export const STATUS_LABEL: Record<TaskStatus, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDA: "Concluída",
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  URGENTE: "Urgente",
};

export const STATUS_TONE = {
  PENDENTE: "neutral",
  EM_ANDAMENTO: "primary",
  CONCLUIDA: "success",
} as const satisfies Record<TaskStatus, string>;

export const PRIORITY_TONE = {
  BAIXA: "neutral",
  MEDIA: "neutral",
  ALTA: "warning",
  URGENTE: "danger",
} as const satisfies Record<TaskPriority, string>;

export const STATUSES = Object.keys(STATUS_LABEL) as TaskStatus[];
export const PRIORITIES = Object.keys(PRIORITY_LABEL) as TaskPriority[];

// Ordem usada para listar: urgente primeiro.
export const PRIORITY_RANK: Record<TaskPriority, number> = { URGENTE: 0, ALTA: 1, MEDIA: 2, BAIXA: 3 };

const TIME_ZONE = "America/Sao_Paulo";

// Prazo é só data. Fica guardado como meia-noite UTC daquele dia ("2026-11-20T00:00Z").
export function dueDateFromInput(value: string): Date | null {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00.000Z`) : null;
}

export function dueDateToInput(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

// Hoje no fuso de Brasília, no mesmo formato em que o prazo é guardado.
export function startOfTodayUtc(now = new Date()): Date {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
  return new Date(`${today}T00:00:00.000Z`);
}

// Atrasada: prazo antes de hoje e ainda não concluída.
export function isOverdue(task: { dueDate: Date | null; status: TaskStatus }, now = new Date()): boolean {
  return task.status !== "CONCLUIDA" && task.dueDate !== null && task.dueDate < startOfTodayUtc(now);
}

export function formatDueDate(date: Date | null): string {
  return date ? new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date) : "Sem prazo";
}
