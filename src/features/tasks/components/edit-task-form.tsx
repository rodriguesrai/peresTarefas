"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { updateTask, type TaskFormState } from "../actions";
import type { TaskFormValues } from "../schemas";
import { TaskFields } from "./task-fields";

export function EditTaskForm({
  id,
  initial,
  people,
}: {
  id: string;
  initial: TaskFormValues;
  people: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState<TaskFormState, FormData>(updateTask, {
    values: initial,
  });

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={id} />
      <TaskFields values={state.values} errors={state.errors} people={people} />
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar alterações"}
        </Button>
        <Link href={`/tarefas/${id}`} className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
