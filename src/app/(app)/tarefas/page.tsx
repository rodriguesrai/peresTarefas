import type { Metadata } from "next";
import Link from "next/link";
import { requireGestor } from "@/features/auth/lib/dal";
import { TaskFilters } from "@/features/tasks/components/task-filters";
import { TaskTable } from "@/features/tasks/components/task-table";
import { listAssignablePeople, listTasks, parseTaskFilters } from "@/features/tasks/lib/queries";

export const metadata: Metadata = { title: "Todas as tarefas | Peres Tarefas" };

export default async function AllTasksPage({ searchParams }: PageProps<"/tarefas">) {
  await requireGestor();
  const filters = parseTaskFilters(await searchParams);
  const [tasks, people] = await Promise.all([listTasks(filters), listAssignablePeople()]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Todas as tarefas</h1>
          <p className="mt-1 text-sm text-muted">{tasks.length} tarefa(s) com os filtros atuais.</p>
        </div>
        <Link
          href="/tarefas/nova"
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Nova tarefa
        </Link>
      </div>
      <TaskFilters filters={filters} people={people} action="/tarefas" />
      <TaskTable tasks={tasks} />
    </div>
  );
}
