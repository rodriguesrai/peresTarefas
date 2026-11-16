import type { Metadata } from "next";
import { requireGestor } from "@/features/auth/lib/dal";
import { CreatePersonForm } from "@/features/people/components/create-person-form";

export const metadata: Metadata = { title: "Nova pessoa | Peres Tarefas" };

export default async function NewPersonPage() {
  await requireGestor();

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Nova pessoa</h1>
        <p className="mt-1 text-sm text-muted">O sistema gera uma senha provisória para o primeiro acesso.</p>
      </div>
      <div className="rounded-lg border border-border bg-surface p-6">
        <CreatePersonForm />
      </div>
    </div>
  );
}
