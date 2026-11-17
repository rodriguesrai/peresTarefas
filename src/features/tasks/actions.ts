"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { requireGestor, requireUser } from "@/features/auth/lib/dal";
import type { TaskStatus } from "@/generated/prisma/enums";
import { getTaskForUser } from "./lib/queries";
import { STATUSES, STATUS_LABEL, formatDueDate } from "./lib/task-meta";
import { TaskSchema, readTaskForm, type TaskFields, type TaskFormValues } from "./schemas";

export type TaskFormState = {
  errors?: Partial<Record<TaskFields, string[]>>;
  values?: TaskFormValues;
};

async function isActivePerson(id: string) {
  return (await prisma.user.count({ where: { id, active: true } })) > 0;
}

export async function createTask(_state: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const me = await requireGestor();

  const values = readTaskForm(formData);
  const parsed = TaskSchema.safeParse(values);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };

  if (!(await isActivePerson(parsed.data.assigneeId))) {
    return { errors: { assigneeId: ["Escolha uma pessoa ativa."] }, values };
  }

  const task = await prisma.task.create({ data: { ...parsed.data, createdById: me.id } });

  revalidatePath("/tarefas");
  redirect(`/tarefas/${task.id}`);
}

export type StatusState = { message?: string };

// Responsável e gestores podem mudar o status.
export async function changeTaskStatus(id: string, status: TaskStatus): Promise<StatusState> {
  const me = await requireUser();
  if (!STATUSES.includes(status)) return { message: "Status inválido." };

  const task = await getTaskForUser(id, me);
  if (!task) return { message: "Tarefa não encontrada." };

  if (task.status === status) return {};

  // A mudança fica registrada no histórico de observações.
  await prisma.$transaction([
    prisma.task.update({
      where: { id },
      data: { status, completedAt: status === "CONCLUIDA" ? new Date() : null },
    }),
    prisma.taskNote.create({
      data: {
        taskId: id,
        authorId: me.id,
        content: `Status alterado de "${STATUS_LABEL[task.status]}" para "${STATUS_LABEL[status]}".`,
      },
    }),
  ]);

  revalidatePath(`/tarefas/${id}`);
  revalidatePath("/tarefas");
  revalidatePath("/");
  return {};
}

const NoteSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { error: "Escreva a observação." })
    .max(2000, { error: "A observação pode ter no máximo 2000 caracteres." }),
});

export type NoteState = { error?: string; savedAt?: number };

// Responsável e gestores registram observações e atualizações na tarefa.
export async function addTaskNote(taskId: string, _state: NoteState, formData: FormData): Promise<NoteState> {
  const me = await requireUser();
  const task = await getTaskForUser(taskId, me);
  if (!task) return { error: "Tarefa não encontrada." };

  const parsed = NoteSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await prisma.taskNote.create({ data: { taskId, authorId: me.id, content: parsed.data.content } });

  revalidatePath(`/tarefas/${taskId}`);
  return { savedAt: Date.now() };
}

export async function updateTask(id: string, _state: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const me = await requireGestor();

  const values = readTaskForm(formData);
  const parsed = TaskSchema.safeParse(values);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };

  const task = await prisma.task.findUnique({
    where: { id },
    include: { assignee: { select: { id: true, name: true } } },
  });
  if (!task) redirect("/tarefas");

  if (parsed.data.assigneeId !== task.assigneeId && !(await isActivePerson(parsed.data.assigneeId))) {
    return { errors: { assigneeId: ["Escolha uma pessoa ativa."] }, values };
  }

  // Troca de responsável e de prazo ficam no histórico.
  const changes: string[] = [];
  if (parsed.data.assigneeId !== task.assigneeId) {
    const next = await prisma.user.findUniqueOrThrow({ where: { id: parsed.data.assigneeId }, select: { name: true } });
    changes.push(`Responsável alterado de ${task.assignee.name} para ${next.name}.`);
  }
  if ((parsed.data.dueDate?.getTime() ?? null) !== (task.dueDate?.getTime() ?? null)) {
    changes.push(`Prazo alterado de ${formatDueDate(task.dueDate)} para ${formatDueDate(parsed.data.dueDate)}.`);
  }

  await prisma.$transaction([
    prisma.task.update({ where: { id }, data: parsed.data }),
    ...changes.map((content) => prisma.taskNote.create({ data: { taskId: id, authorId: me.id, content } })),
  ]);

  revalidatePath("/tarefas");
  redirect(`/tarefas/${id}`);
}

// Para tarefas criadas por engano. As observações são apagadas junto.
export async function deleteTask(id: string) {
  await requireGestor();
  await prisma.task.deleteMany({ where: { id } });
  revalidatePath("/tarefas");
  redirect("/tarefas");
}
