import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Peres Tarefas",
  description: "Controle de tarefas e responsabilidades da equipe",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
