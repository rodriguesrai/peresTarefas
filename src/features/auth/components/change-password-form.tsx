"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { changePassword, type ChangePasswordState } from "../password-actions";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<ChangePasswordState, FormData>(changePassword, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Senha atual" htmlFor="current" error={state.errors?.current?.[0]}>
        <Input id="current" name="current" type="password" autoComplete="current-password" autoFocus required />
      </Field>
      <Field label="Nova senha" htmlFor="password" error={state.errors?.password?.[0]}>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </Field>
      <Field label="Repita a nova senha" htmlFor="confirm" error={state.errors?.confirm?.[0]}>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar nova senha"}
      </Button>
    </form>
  );
}
