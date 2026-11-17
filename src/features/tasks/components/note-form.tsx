"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { addTaskNote, type NoteState } from "../actions";

export function NoteForm({ taskId }: { taskId: string }) {
  const [state, action, pending] = useActionState<NoteState, FormData>(addTaskNote, {});
  const formRef = useRef<HTMLFormElement>(null);

  // Limpa o campo depois de salvar.
  useEffect(() => {
    if (state.savedAt) formRef.current?.reset();
  }, [state.savedAt]);

  return (
    <form ref={formRef} action={action} className="space-y-2">
      <input type="hidden" name="taskId" value={taskId} />
      <label htmlFor="content" className="sr-only">
        Nova observação
      </label>
      <textarea
        id="content"
        name="content"
        rows={3}
        required
        placeholder="Ex.: Cliente enviou os documentos, falta só a procuração."
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Adicionar observação"}
      </Button>
    </form>
  );
}
