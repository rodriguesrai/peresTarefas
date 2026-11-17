"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { updatePerson, type UpdatePersonState } from "../actions";
import type { PersonFormValues } from "../schemas";
import { PersonFields } from "./person-fields";

export function EditPersonForm({ id, initial }: { id: string; initial: PersonFormValues }) {
  const [state, action, pending] = useActionState<UpdatePersonState, FormData>(updatePerson, {
    values: initial,
  });

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={id} />
      <PersonFields values={state.values} errors={state.errors} />
      {state.message && (
        <p role="alert" className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      )}
      {state.saved && <p className="text-sm text-green-700">Alterações salvas.</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}
