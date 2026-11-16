import type { ReactNode } from "react";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-background text-muted border-border",
  primary: "bg-primary/10 text-primary border-primary/20",
  success: "bg-green-50 text-green-800 border-green-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  danger: "bg-red-50 text-red-800 border-red-200",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
