import Link from "next/link";
import { Select } from "@/components/ui/select";
import type { TaskFilters as Filters } from "../lib/queries";
import { PRIORITIES, PRIORITY_LABEL, STATUSES, STATUS_LABEL } from "../lib/task-meta";

// Formulário GET: os filtros ficam na URL e podem ser salvos nos favoritos.
export function TaskFilters({
  filters,
  people,
  action,
}: {
  filters: Filters;
  people?: { id: string; name: string }[];
  action: string;
}) {
  return (
    <form action={action} className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-4">
      {people && (
        <label className="flex min-w-44 flex-col gap-1 text-sm">
          <span className="text-muted">Responsável</span>
          <Select name="responsavel" defaultValue={filters.assigneeId ?? ""}>
            <option value="">Todos</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </Select>
        </label>
      )}
      <label className="flex min-w-36 flex-col gap-1 text-sm">
        <span className="text-muted">Status</span>
        <Select name="status" defaultValue={filters.status ?? ""}>
          <option value="">Em aberto</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABEL[status]}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex min-w-36 flex-col gap-1 text-sm">
        <span className="text-muted">Prioridade</span>
        <Select name="prioridade" defaultValue={filters.priority ?? ""}>
          <option value="">Todas</option>
          {PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_LABEL[priority]}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex h-10 items-center gap-2 text-sm">
        <input type="checkbox" name="atrasadas" value="1" defaultChecked={filters.overdue} className="size-4" />
        Só atrasadas
      </label>
      <label className="flex h-10 items-center gap-2 text-sm">
        <input type="checkbox" name="concluidas" value="1" defaultChecked={filters.includeDone} className="size-4" />
        Incluir concluídas
      </label>
      <div className="flex gap-2">
        <button type="submit" className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">
          Filtrar
        </button>
        <Link href={action} className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm">
          Limpar
        </Link>
      </div>
    </form>
  );
}
