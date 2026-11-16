import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/login-form";
import { needsInitialSetup } from "@/features/auth/lib/bootstrap";
import { getCurrentUser } from "@/features/auth/lib/dal";

export const metadata: Metadata = { title: "Entrar | Peres Tarefas" };

export default async function LoginPage() {
  if (await needsInitialSetup()) redirect("/configuracao-inicial");
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-semibold">Peres Tarefas</h1>
        <p className="mb-6 mt-1 text-sm text-muted">Entre com seu e-mail e senha.</p>
        <LoginForm />
      </div>
    </main>
  );
}
