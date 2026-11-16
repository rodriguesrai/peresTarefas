"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { requireGestor, requireUser } from "@/features/auth/lib/dal";
import type { TaskStatus } from "@/generated/prisma/enums";
import { getTaskForUser } from "./lib/queries";
import { STATUSES } from "./lib/task-meta";
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

  await prisma.task.update({
    where: { id },
    data: { status, completedAt: status === "CONCLUIDA" ? new Date() : null },
  });

  revalidatePath(`/tarefas/${id}`);
  revalidatePath("/tarefas");
  revalidatePath("/");
  return {};
}
