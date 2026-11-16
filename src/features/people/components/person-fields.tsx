import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { PersonFields as FieldName, PersonFormValues } from "../schemas";

// Campos compartilhados entre cadastro e edição.
export function PersonFields({
  values,
  errors,
}: {
  values?: PersonFormValues;
  errors?: Partial<Record<FieldName, string[]>>;
}) {
  return (
    <>
      <Field label="Nome completo" htmlFor="name" error={errors?.name?.[0]}>
        <Input id="name" name="name" defaultValue={values?.name} required />
      </Field>
      <Field label="E-mail (usado para entrar)" htmlFor="email" error={errors?.email?.[0]}>
        <Input id="email" name="email" type="email" defaultValue={values?.email} required />
      </Field>
      <Field label="Cargo (opcional)" htmlFor="position" error={errors?.position?.[0]}>
        <Input id="position" name="position" placeholder="Ex.: Advogada, Estagiário, Secretária" defaultValue={values?.position} />
      </Field>
      <Field label="Perfil" htmlFor="role" error={errors?.role?.[0]}>
        <Select id="role" name="role" defaultValue={values?.role || "COLABORADOR"}>
          <option value="COLABORADOR">Colaborador: vê e atualiza as próprias tarefas</option>
          <option value="GESTOR">Gestor: distribui tarefas e acompanha a equipe</option>
        </Select>
      </Field>
    </>
  );
}
