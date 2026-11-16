"use server";

import { redirect } from "next/navigation";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "./lib/dal";
import { hashPassword, verifyPassword } from "./lib/password";
import { createSession } from "./lib/session";
import { PasswordSchema } from "./schemas";

const ChangePasswordSchema = z
  .object({
    current: z.string().min(1, { error: "Informe a senha atual." }),
    password: PasswordSchema,
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    error: "As senhas não conferem.",
    path: ["confirm"],
  })
  .refine((data) => data.password !== data.current, {
    error: "A nova senha precisa ser diferente da atual.",
    path: ["password"],
  });

export type ChangePasswordState = {
  errors?: Partial<Record<"current" | "password" | "confirm", string[]>>;
};

export async function changePassword(
  _state: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const me = await requireUser({ allowPendingPasswordChange: true });

  const parsed = ChangePasswordSchema.safeParse({
    current: formData.get("current"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };

  const user = await prisma.user.findUniqueOrThrow({ where: { id: me.id } });
  if (!(await verifyPassword(parsed.data.current, user.passwordHash))) {
    return { errors: { current: ["Senha atual incorreta."] } };
  }

  // Nova versão de sessão: outros navegadores logados com a senha antiga saem.
  const updated = await prisma.user.update({
    where: { id: me.id },
    data: {
      passwordHash: await hashPassword(parsed.data.password),
      mustChangePassword: false,
      sessionVersion: { increment: 1 },
    },
  });

  await createSession({ userId: updated.id, role: updated.role, sessionVersion: updated.sessionVersion });
  redirect("/");
}
