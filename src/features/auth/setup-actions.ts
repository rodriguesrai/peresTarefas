"use server";

import { redirect } from "next/navigation";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "./lib/password";
import { createSession } from "./lib/session";
import { EmailSchema, NameSchema, PasswordSchema } from "./schemas";

const SetupSchema = z
  .object({
    name: NameSchema,
    email: EmailSchema,
    password: PasswordSchema,
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    error: "As senhas não conferem.",
    path: ["confirm"],
  });

export type SetupState = {
  errors?: Partial<Record<"name" | "email" | "password" | "confirm", string[]>>;
  values?: { name?: string; email?: string };
};

export async function createFirstManager(_state: SetupState, formData: FormData): Promise<SetupState> {
  const values = { name: String(formData.get("name") ?? ""), email: String(formData.get("email") ?? "") };
  const parsed = SetupSchema.safeParse({
    ...values,
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };

  const passwordHash = await hashPassword(parsed.data.password);

  // Só cria se ainda não houver ninguém: a configuração inicial acontece uma única vez.
  const user = await prisma.$transaction(async (tx) => {
    if ((await tx.user.count()) > 0) return null;
    return tx.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        role: "GESTOR",
        mustChangePassword: false,
      },
    });
  });

  if (!user) redirect("/login");

  await createSession({ userId: user.id, role: user.role });
  redirect("/");
}
