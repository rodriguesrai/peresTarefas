import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/features/auth/lib/dal";
import { NoteForm } from "@/features/tasks/components/note-form";
import { NoteList } from "@/features/tasks/components/note-list";
import { StatusButtons } from "@/features/tasks/components/status-buttons";
import { getTaskForUser, listTaskNotes } from "@/features/tasks/lib/queries";
import { PRIORITY_LABEL, PRIORITY_TONE, formatDueDate, isOverdue } from "@/features/tasks/lib/task-meta";

export const metadata: Metadata = { title: "Tarefa | Peres Tarefas" };

const dateTime = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

export default async function TaskPage({ params }: PageProps<"/tarefas/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const task = await getTaskForUser(id, user);
  if (!task) notFound();
  const notes = await listTaskNotes(task.id);

  const overdue = isOverdue(task);
  const backHref = user.role === "GESTOR" ? "/tarefas" : "/";

  return (
    <div className="max-w-3xl space-y-4">
      <Link href={backHref} className="text-sm text-muted hover:text-foreground">
        ← Voltar
      </Link>

      <div className="space-y-4 rounded-lg border border-border bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-xl font-semibold">{task.title}</h1>
          <div className="flex gap-2">
            <Badge tone={PRIORITY_TONE[task.priority]}>{PRIORITY_LABEL[task.priority]}</Badge>
            {overdue && <Badge tone="danger">Atrasada</Badge>}
          </div>
        </div>

        {task.description && <p className="whitespace-pre-wrap text-sm">{task.description}</p>}

        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted">Responsável</dt>
            <dd className="font-medium">{task.assignee.name}</dd>
          </div>
          <div>
            <dt className="text-muted">Prazo</dt>
            <dd className={overdue ? "font-medium text-danger" : "font-medium"}>{formatDueDate(task.dueDate)}</dd>
          </div>
          <div>
            <dt className="text-muted">Criada por</dt>
            <dd className="font-medium">
              {task.createdBy.name} <span className="font-normal text-muted">em {dateTime.format(task.createdAt)}</span>
            </dd>
          </div>
        </dl>

        <div className="border-t border-border pt-4">
          <p className="mb-2 text-sm text-muted">Status</p>
          <StatusButtons id={task.id} current={task.status} />
          {task.completedAt && (
            <p className="mt-2 text-sm text-muted">Concluída em {dateTime.format(task.completedAt)}.</p>
          )}
        </div>
      </div>

      <section className="space-y-4 rounded-lg border border-border bg-surface p-6">
        <h2 className="font-medium">Observações e atualizações</h2>
        <NoteList notes={notes} />
        <NoteForm taskId={task.id} />
      </section>
    </div>
  );
}
