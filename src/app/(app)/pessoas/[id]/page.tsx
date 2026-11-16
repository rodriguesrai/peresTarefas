import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireGestor } from "@/features/auth/lib/dal";
import { EditPersonForm } from "@/features/people/components/edit-person-form";
import { getPerson } from "@/features/people/lib/queries";

export const metadata: Metadata = { title: "Editar pessoa | Peres Tarefas" };

export default async function EditPersonPage({ params }: PageProps<"/pessoas/[id]">) {
  await requireGestor();
  const { id } = await params;
  const person = await getPerson(id);
  if (!person) notFound();

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <Link href="/pessoas" className="text-sm text-muted hover:text-foreground">
          ← Pessoas
        </Link>
        <h1 className="mt-2 text-xl font-semibold">{person.name}</h1>
      </div>
      <div className="rounded-lg border border-border bg-surface p-6">
        <EditPersonForm
          id={person.id}
          initial={{
            name: person.name,
            email: person.email,
            position: person.position ?? "",
            role: person.role,
          }}
        />
      </div>
    </div>
  );
}
