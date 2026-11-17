"use client";

import { useTransition } from "react";
import { deleteTask } from "../actions";

export function DeleteTaskButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("Excluir esta tarefa e todas as observações dela? Isso não pode ser desfeito.")) {
          startTransition(() => deleteTask(id));
        }
      }}
      className="text-sm text-danger underline-offset-2 hover:underline disabled:opacity-60"
    >
      {pending ? "Excluindo..." : "Excluir tarefa"}
    </button>
  );
}
