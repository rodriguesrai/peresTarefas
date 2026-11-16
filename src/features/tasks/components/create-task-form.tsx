"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createTask, type TaskFormState } from "../actions";
import { TaskFields } from "./task-fields";

export function CreateTaskForm({ people, defaultAssigneeId }: { people: { id: string; name: string }[]; defaultAssigneeId?: string }) {
  const [state, action, pending] = useActionState<TaskFormState, FormData>(createTask, {
    values: { assigneeId: defaultAssigneeId },
  });

  return (
    <form action={action} className="flex flex-col gap-4">
      <TaskFields values={state.values} errors={state.errors} people={people} />
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Criar tarefa"}
        </Button>
        <Link href="/tarefas" className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
