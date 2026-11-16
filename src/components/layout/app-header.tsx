import Link from "next/link";
import { logout } from "@/features/auth/actions";
import type { CurrentUser } from "@/features/auth/lib/dal";

const links = [
  { href: "/", label: "Minhas tarefas", gestorOnly: false },
  { href: "/tarefas", label: "Todas as tarefas", gestorOnly: true },
  { href: "/painel", label: "Painel", gestorOnly: true },
  { href: "/pessoas", label: "Pessoas", gestorOnly: true },
];

export function AppHeader({ user }: { user: CurrentUser }) {
  const visible = links.filter((link) => !link.gestorOnly || user.role === "GESTOR");

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="font-semibold text-primary">
          Peres Tarefas
        </Link>
        <nav className="flex flex-1 flex-wrap gap-4 text-sm">
          {visible.map((link) => (
            <Link key={link.href} href={link.href} className="text-muted hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/alterar-senha" className="text-muted hover:text-foreground" title="Alterar senha">
            {user.name}
          </Link>
          <form action={logout}>
            <button type="submit" className="text-muted underline-offset-2 hover:text-foreground hover:underline">
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
