import type { Metadata } from "next";
import { connection } from "next/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Peres Tarefas",
  description: "Controle de tarefas e responsabilidades da equipe",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Todas as telas leem o banco: nada deve ser pré-renderizado no build.
  await connection();

  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
