"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createFirstManager, type SetupState } from "../setup-actions";

export function SetupForm() {
  const [state, action, pending] = useActionState<SetupState, FormData>(createFirstManager, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Seu nome" htmlFor="name" error={state.errors?.name?.[0]}>
        <Input id="name" name="name" defaultValue={state.values?.name} autoFocus required />
      </Field>
      <Field label="Seu e-mail" htmlFor="email" error={state.errors?.email?.[0]}>
        <Input id="email" name="email" type="email" autoComplete="username" defaultValue={state.values?.email} required />
      </Field>
      <Field label="Crie uma senha" htmlFor="password" error={state.errors?.password?.[0]}>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </Field>
      <Field label="Repita a senha" htmlFor="confirm" error={state.errors?.confirm?.[0]}>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Começar a usar"}
      </Button>
    </form>
  );
}
