import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { TaskListItem } from "../lib/queries";
import {
  PRIORITY_LABEL,
  PRIORITY_TONE,
  STATUS_LABEL,
  STATUS_TONE,
  formatDueDate,
  isOverdue,
} from "../lib/task-meta";

export function TaskTable({ tasks, showAssignee = true }: { tasks: TaskListItem[]; showAssignee?: boolean }) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
        Nenhuma tarefa encontrada.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Tarefa</th>
            {showAssignee && <th className="px-4 py-3 font-medium">Responsável</th>}
            <th className="px-4 py-3 font-medium">Prazo</th>
            <th className="px-4 py-3 font-medium">Prioridade</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const overdue = isOverdue(task);
            return (
              <tr key={task.id} className={`border-b border-border last:border-0 ${overdue ? "bg-red-50/60" : ""}`}>
                <td className="px-4 py-3">
                  <Link href={`/tarefas/${task.id}`} className="font-medium hover:text-primary hover:underline">
                    {task.title}
                  </Link>
                  {task._count.notes > 0 && (
                    <span className="ml-2 text-xs text-muted">
                      {task._count.notes} {task._count.notes === 1 ? "observação" : "observações"}
                    </span>
                  )}
                </td>
                {showAssignee && <td className="px-4 py-3">{task.assignee.name}</td>}
                <td className="whitespace-nowrap px-4 py-3">
                  <span className={overdue ? "font-medium text-danger" : ""}>{formatDueDate(task.dueDate)}</span>
                  {overdue && (
                    <span className="ml-2">
                      <Badge tone="danger">Atrasada</Badge>
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={PRIORITY_TONE[task.priority]}>{PRIORITY_LABEL[task.priority]}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONE[task.status]}>{STATUS_LABEL[task.status]}</Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
