import type { Metadata } from "next";
import { requireGestor } from "@/features/auth/lib/dal";
import { CreateTaskForm } from "@/features/tasks/components/create-task-form";
import { listAssignablePeople } from "@/features/tasks/lib/queries";

export const metadata: Metadata = { title: "Nova tarefa | Peres Tarefas" };

export default async function NewTaskPage({ searchParams }: PageProps<"/tarefas/nova">) {
  await requireGestor();
  const people = await listAssignablePeople();
  const { responsavel } = await searchParams;
  const defaultAssigneeId = typeof responsavel === "string" ? responsavel : undefined;

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Nova tarefa</h1>
        <p className="mt-1 text-sm text-muted">Defina o que precisa ser feito, quem é o responsável e o prazo.</p>
      </div>
      <div className="rounded-lg border border-border bg-surface p-6">
        <CreateTaskForm people={people} defaultAssigneeId={defaultAssigneeId} />
      </div>
    </div>
  );
}
