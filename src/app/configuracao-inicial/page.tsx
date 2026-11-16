import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SetupForm } from "@/features/auth/components/setup-form";
import { needsInitialSetup } from "@/features/auth/lib/bootstrap";
import { SETUP_TOKEN_FILE, ensureSetupToken, isValidSetupToken } from "@/features/auth/lib/setup-token";

export const metadata: Metadata = { title: "Configuração inicial | Peres Tarefas" };

export default async function InitialSetupPage({ searchParams }: PageProps<"/configuracao-inicial">) {
  if (!(await needsInitialSetup())) redirect("/login");

  const token = ensureSetupToken();
  const { token: provided } = await searchParams;
  const valid = isValidSetupToken(provided);

  if (!valid) {
    console.info(`Configuração inicial: http://localhost:${process.env.PORT ?? 3000}/configuracao-inicial?token=${token}`);
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-semibold">Bem-vindo ao Peres Tarefas</h1>
        {valid ? (
          <>
            <p className="mb-6 mt-1 text-sm text-muted">
              Este é o primeiro acesso. Cadastre a pessoa que vai gerenciar o sistema. Depois você
              poderá cadastrar o restante da equipe.
            </p>
            <SetupForm token={token} />
          </>
        ) : (
          <div className="mt-3 space-y-3 text-sm text-muted">
            <p>O sistema ainda não foi configurado.</p>
            <p>
              No computador onde o sistema está instalado, abra o arquivo{" "}
              <strong className="text-foreground">Iniciar Peres Tarefas</strong>. A tela de
              configuração vai abrir sozinha no navegador.
            </p>
            <p className="text-xs">
              Para técnicos: o link com o token aparece na janela do servidor e o token fica em{" "}
              <code>{SETUP_TOKEN_FILE}</code>.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
