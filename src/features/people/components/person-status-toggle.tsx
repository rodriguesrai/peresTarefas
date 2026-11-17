"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { setPersonActive, type PersonActionState } from "../actions";

export function PersonStatusToggle({ id, active }: { id: string; active: boolean }) {
  const [state, action, pending] = useActionState<PersonActionState, FormData>(setPersonActive, {});

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (active && !confirm("Desativar o acesso desta pessoa? As tarefas dela continuam no sistema.")) {
          event.preventDefault();
        }
      }}
      className="space-y-2"
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="active" value={active ? "0" : "1"} />
      <p className="text-sm text-muted">
        {active
          ? "Pessoa ativa: pode entrar no sistema e receber tarefas."
          : "Pessoa inativa: não consegue entrar e não aparece para receber tarefas."}
      </p>
      <Button type="submit" variant={active ? "danger" : "secondary"} disabled={pending}>
        {active ? "Desativar acesso" : "Reativar acesso"}
      </Button>
      {state.message && <p className="text-sm text-danger">{state.message}</p>}
      {state.ok && <p className="text-sm text-green-700">{state.ok}</p>}
    </form>
  );
}
