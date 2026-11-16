import * as z from "zod";
import { PRIORITIES, dueDateFromInput } from "./lib/task-meta";

export const TaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { error: "Descreva a tarefa em pelo menos 3 caracteres." })
    .max(200, { error: "O título pode ter no máximo 200 caracteres." }),
  description: z
    .string()
    .trim()
    .max(5000, { error: "A descrição pode ter no máximo 5000 caracteres." })
    .transform((value) => (value === "" ? null : value)),
  assigneeId: z.string().min(1, { error: "Escolha o responsável." }),
  priority: z.enum(PRIORITIES, { error: "Escolha a prioridade." }),
  dueDate: z
    .string()
    .refine((value) => value === "" || dueDateFromInput(value) !== null, { error: "Data inválida." })
    .transform((value) => dueDateFromInput(value)),
});

export type TaskFields = "title" | "description" | "assigneeId" | "priority" | "dueDate";

export type TaskFormValues = Partial<Record<TaskFields, string>>;

export function readTaskForm(formData: FormData): TaskFormValues {
  return {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    assigneeId: String(formData.get("assigneeId") ?? ""),
    priority: String(formData.get("priority") ?? ""),
    dueDate: String(formData.get("dueDate") ?? ""),
  };
}
