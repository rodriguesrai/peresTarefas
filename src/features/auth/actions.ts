"use server";

import { redirect } from "next/navigation";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "./lib/password";
import { clearLoginFailures, isLoginBlocked, registerLoginFailure } from "./lib/rate-limit";
import { createSession, deleteSession } from "./lib/session";

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, { error: "Informe o e-mail." }),
  password: z.string().min(1, { error: "Informe a senha." }),
});

const DUMMY_HASH = ["scrypt", "0".repeat(32), "0".repeat(128)].join("$");

export type LoginState = {
  errors?: { email?: string[]; password?: string[] };
  message?: string;
  email?: string;
};

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, email: String(formData.get("email") ?? "") };
  }

  const { email, password } = parsed.data;
  if (isLoginBlocked(email)) {
    return { message: "Muitas tentativas. Aguarde 15 minutos e tente de novo.", email };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // Sempre calcula o hash, para o tempo de resposta não revelar se o e-mail existe.
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

  // Mesma mensagem para e-mail inexistente e senha errada.
  if (!user || !valid || !user.active) {
    registerLoginFailure(email);
    return { message: "E-mail ou senha incorretos.", email };
  }

  clearLoginFailures(email);

  await createSession({ userId: user.id, role: user.role, sessionVersion: user.sessionVersion });
  redirect(user.mustChangePassword ? "/alterar-senha" : "/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
