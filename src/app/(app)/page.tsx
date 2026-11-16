import { requireUser } from "@/features/auth/lib/dal";

export default async function MyTasksPage() {
  const user = await requireUser();

  return (
    <div>
      <h1 className="text-xl font-semibold">Minhas tarefas</h1>
      <p className="mt-1 text-sm text-muted">Olá, {user.name}.</p>
    </div>
  );
}
