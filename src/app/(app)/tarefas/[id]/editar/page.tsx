import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireGestor } from "@/features/auth/lib/dal";
import { DeleteTaskButton } from "@/features/tasks/components/delete-task-button";
import { EditTaskForm } from "@/features/tasks/components/edit-task-form";
import { getTaskForUser, listAssignablePeople } from "@/features/tasks/lib/queries";
import { dueDateToInput } from "@/features/tasks/lib/task-meta";

export const metadata: Metadata = { title: "Editar tarefa | Peres Tarefas" };

export default async function EditTaskPage({ params }: PageProps<"/tarefas/[id]/editar">) {
  const user = await requireGestor();
  const { id } = await params;
  const [task, people] = await Promise.all([getTaskForUser(id, user), listAssignablePeople()]);
  if (!task) notFound();

  // Se o responsável atual foi desativado, ele continua aparecendo na lista.
  const options = people.some((person) => person.id === task.assignee.id) ? people : [task.assignee, ...people];

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Editar tarefa</h1>
      <div className="rounded-lg border border-border bg-surface p-6">
        <EditTaskForm
          id={task.id}
          people={options}
          initial={{
            title: task.title,
            description: task.description ?? "",
            assigneeId: task.assigneeId,
            priority: task.priority,
            dueDate: dueDateToInput(task.dueDate),
          }}
        />
      </div>
      <div className="rounded-lg border border-red-200 bg-surface p-4">
        <p className="mb-2 text-sm text-muted">
          Criou por engano? Para tarefas que perderam o sentido, prefira concluir e registrar uma observação.
        </p>
        <DeleteTaskButton id={task.id} />
      </div>
    </div>
  );
}
