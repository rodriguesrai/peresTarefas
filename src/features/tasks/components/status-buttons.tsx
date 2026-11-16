"use client";

import { useState, useTransition } from "react";
import type { TaskStatus } from "@/generated/prisma/enums";
import { changeTaskStatus } from "../actions";
import { STATUSES, STATUS_LABEL } from "../lib/task-meta";

// Um clique muda o status: sem formulário, para não virar burocracia.
export function StatusButtons({ id, current }: { id: string; current: TaskStatus }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();

  return (
    <div className="space-y-2">
      <div className="inline-flex flex-wrap overflow-hidden rounded-md border border-border">
        {STATUSES.map((status) => {
          const active = status === current;
          return (
            <button
              key={status}
              type="button"
              disabled={pending || active}
              aria-pressed={active}
              onClick={() =>
                startTransition(async () => {
                  const result = await changeTaskStatus(id, status);
                  setMessage(result.message);
                })
              }
              className={`border-r border-border px-4 py-2 text-sm last:border-r-0 disabled:cursor-default ${
                active ? "bg-primary font-medium text-primary-foreground" : "bg-surface hover:bg-background"
              }`}
            >
              {STATUS_LABEL[status]}
            </button>
          );
        })}
      </div>
      {message && <p className="text-sm text-danger">{message}</p>}
    </div>
  );
}
