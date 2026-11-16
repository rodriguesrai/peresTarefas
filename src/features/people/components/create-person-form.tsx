"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createPerson, type CreatePersonState } from "../actions";
import { PersonFields } from "./person-fields";
import { TemporaryPasswordNotice } from "./temporary-password-notice";

export function CreatePersonForm() {
  const [state, action, pending] = useActionState<CreatePersonState, FormData>(createPerson, {});

  if (state.created) {
    return (
      <div className="space-y-4">
        <TemporaryPasswordNotice
          name={state.created.name}
          email={state.created.email}
          password={state.created.temporaryPassword}
        />
        <div className="flex gap-3">
          <Link href="/pessoas" className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            Voltar para a lista
          </Link>
          <a href="/pessoas/nova" className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium">
            Cadastrar outra pessoa
          </a>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <PersonFields values={state.values} errors={state.errors} />
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Cadastrar"}
        </Button>
        <Link href="/pessoas" className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
