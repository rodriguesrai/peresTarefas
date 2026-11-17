import type { Metadata } from "next";
import Link from "next/link";
import { requireGestor } from "@/features/auth/lib/dal";
import { getDashboard } from "@/features/dashboard/lib/queries";
import { TaskTable } from "@/features/tasks/components/task-table";

export const metadata: Metadata = { title: "Painel | Peres Tarefas" };

export default async function DashboardPage() {
  await requireGestor();
  const { totals, workload, overdueTasks, dueSoon } = await getDashboard();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Painel da equipe</h1>
        <p className="mt-1 text-sm text-muted">Visão geral das demandas do escritório.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Em aberto" value={totals.open} href="/tarefas" />
        <Stat label="Em andamento" value={totals.inProgress} href="/tarefas?status=EM_ANDAMENTO" />
        <Stat label="Atrasadas" value={totals.overdue} href="/tarefas?atrasadas=1" danger={totals.overdue > 0} />
        <Stat label="Concluídas em 7 dias" value={totals.doneLastWeek} href="/tarefas?status=CONCLUIDA" />
      </div>

      <section className="space-y-3">
        <h2 className="font-medium">Por pessoa</h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Pessoa</th>
                <th className="px-4 py-3 text-right font-medium">Pendentes</th>
                <th className="px-4 py-3 text-right font-medium">Em andamento</th>
                <th className="px-4 py-3 text-right font-medium">Atrasadas</th>
                <th className="px-4 py-3 text-right font-medium">Concluídas (7 dias)</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {workload.map((person) => (
                <tr key={person.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/tarefas?responsavel=${person.id}`} className="hover:text-primary hover:underline">
                      {person.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right">{person.pending}</td>
                  <td className="px-4 py-3 text-right">{person.inProgress}</td>
                  <td className={`px-4 py-3 text-right ${person.overdue > 0 ? "font-semibold text-danger" : ""}`}>
                    {person.overdue}
                  </td>
                  <td className="px-4 py-3 text-right">{person.doneLastWeek}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/tarefas/nova?responsavel=${person.id}`} className="text-primary hover:underline">
                      + tarefa
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Atrasadas</h2>
        <TaskTable tasks={overdueTasks} />
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Vencem nos próximos 3 dias</h2>
        <TaskTable tasks={dueSoon} />
      </section>
    </div>
  );
}

function Stat({ label, value, href, danger }: { label: string; value: number; href: string; danger?: boolean }) {
  return (
    <Link href={href} className={`rounded-lg border bg-surface p-4 hover:shadow-sm ${danger ? "border-red-200" : "border-border"}`}>
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${danger ? "text-danger" : ""}`}>{value}</p>
    </Link>
  );
}
