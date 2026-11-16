"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { requireGestor } from "@/features/auth/lib/dal";
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
