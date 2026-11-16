import type { Metadata } from "next";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { requireUser } from "@/features/auth/lib/dal";

export const metadata: Metadata = { title: "Alterar senha | Peres Tarefas" };

export default async function ChangePasswordPage() {
  const user = await requireUser({ allowPendingPasswordChange: true });

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-semibold">Alterar senha</h1>
        <p className="mb-6 mt-1 text-sm text-muted">
          {user.mustChangePassword
            ? "Por segurança, crie uma senha só sua antes de continuar."
            : "Escolha uma nova senha de pelo menos 8 caracteres."}
        </p>
        <ChangePasswordForm />
      </div>
    </main>
  );
}
