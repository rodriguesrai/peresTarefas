"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { resetPersonPassword, type ResetPasswordState } from "../actions";
import { TemporaryPasswordNotice } from "./temporary-password-notice";

export function ResetPasswordButton({ id, name, email }: { id: string; name: string; email: string }) {
  const [state, action, pending] = useActionState<ResetPasswordState>(resetPersonPassword.bind(null, id), {});

  if (state.temporaryPassword) {
    return <TemporaryPasswordNotice name={name} email={email} password={state.temporaryPassword} />;
  }

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm(`Gerar uma nova senha provisória para ${name}? A senha atual deixa de funcionar.`)) {
          event.preventDefault();
        }
      }}
      className="space-y-2"
    >
      <p className="text-sm text-muted">Use quando a pessoa esquecer a senha.</p>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Gerando..." : "Gerar nova senha provisória"}
      </Button>
      {state.message && <p className="text-sm text-danger">{state.message}</p>}
    </form>
  );
}
