import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { requireGestor } from "@/features/auth/lib/dal";
import { listPeople } from "@/features/people/lib/queries";

export const metadata: Metadata = { title: "Pessoas | Peres Tarefas" };

export default async function PeoplePage() {
  await requireGestor();
  const people = await listPeople();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Pessoas</h1>
          <p className="mt-1 text-sm text-muted">Equipe do escritório e quem tem acesso ao sistema.</p>
        </div>
        <Link
          href="/pessoas/nova"
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Nova pessoa
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Cargo</th>
              <th className="px-4 py-3 font-medium">Perfil</th>
              <th className="px-4 py-3 font-medium">Tarefas abertas</th>
              <th className="px-4 py-3 font-medium">Situação</th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium">{person.name}</div>
                  <div className="text-muted">{person.email}</div>
                </td>
                <td className="px-4 py-3">{person.position ?? <span className="text-muted">—</span>}</td>
                <td className="px-4 py-3">
                  <Badge tone={person.role === "GESTOR" ? "primary" : "neutral"}>
                    {person.role === "GESTOR" ? "Gestor" : "Colaborador"}
                  </Badge>
                </td>
                <td className="px-4 py-3">{person.openTasks}</td>
                <td className="px-4 py-3">
                  <Badge tone={person.active ? "success" : "neutral"}>{person.active ? "Ativo" : "Inativo"}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
