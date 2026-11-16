import Link from "next/link";
import { requireUser } from "@/features/auth/lib/dal";
import { TaskFilters } from "@/features/tasks/components/task-filters";
import { TaskTable } from "@/features/tasks/components/task-table";
import { listTasks, parseTaskFilters } from "@/features/tasks/lib/queries";
import { isOverdue } from "@/features/tasks/lib/task-meta";

export default async function MyTasksPage({ searchParams }: PageProps<"/">) {
  const user = await requireUser();
  // O responsável é sempre a própria pessoa, seja qual for a URL.
  const filters = { ...parseTaskFilters(await searchParams), assigneeId: user.id };
  const [tasks, open] = await Promise.all([listTasks(filters), listTasks({ assigneeId: user.id })]);

  const overdue = open.filter((task) => isOverdue(task)).length;
  const inProgress = open.filter((task) => task.status === "EM_ANDAMENTO").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Minhas tarefas</h1>
          <p className="mt-1 text-sm text-muted">Olá, {user.name.split(" ")[0]}.</p>
        </div>
        {user.role === "GESTOR" && (
          <Link
            href={`/tarefas/nova?responsavel=${user.id}`}
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Nova tarefa para mim
          </Link>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Summary label="Em aberto" value={open.length} href="/" />
        <Summary label="Em andamento" value={inProgress} href="/?status=EM_ANDAMENTO" />
        <Summary label="Atrasadas" value={overdue} href="/?atrasadas=1" danger={overdue > 0} />
      </div>

      <TaskFilters filters={filters} action="/" />
      <TaskTable tasks={tasks} showAssignee={false} />
    </div>
  );
}

function Summary({ label, value, href, danger }: { label: string; value: number; href: string; danger?: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-lg border bg-surface p-4 hover:shadow-sm ${danger ? "border-red-200" : "border-border"}`}
    >
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${danger ? "text-danger" : ""}`}>{value}</p>
    </Link>
  );
}
