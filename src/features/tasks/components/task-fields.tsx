import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PRIORITIES, PRIORITY_LABEL } from "../lib/task-meta";
import type { TaskFields as FieldName, TaskFormValues } from "../schemas";

// Campos compartilhados entre criar e editar tarefa.
export function TaskFields({
  values,
  errors,
  people,
}: {
  values?: TaskFormValues;
  errors?: Partial<Record<FieldName, string[]>>;
  people: { id: string; name: string }[];
}) {
  return (
    <>
      <Field label="O que precisa ser feito" htmlFor="title" error={errors?.title?.[0]}>
        <Input id="title" name="title" defaultValue={values?.title} placeholder="Ex.: Protocolar petição do cliente Silva" required />
      </Field>
      <Field label="Detalhes (opcional)" htmlFor="description" error={errors?.description?.[0]}>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={values?.description}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Responsável" htmlFor="assigneeId" error={errors?.assigneeId?.[0]}>
          <Select id="assigneeId" name="assigneeId" defaultValue={values?.assigneeId ?? ""} required>
            <option value="" disabled>
              Escolha...
            </option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Prioridade" htmlFor="priority" error={errors?.priority?.[0]}>
          <Select id="priority" name="priority" defaultValue={values?.priority || "MEDIA"}>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABEL[priority]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Prazo (opcional)" htmlFor="dueDate" error={errors?.dueDate?.[0]}>
          <Input id="dueDate" name="dueDate" type="date" defaultValue={values?.dueDate} />
        </Field>
      </div>
    </>
  );
}
