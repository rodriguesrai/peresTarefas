import * as z from "zod";

export const PasswordSchema = z
  .string()
  .min(8, { error: "A senha precisa ter pelo menos 8 caracteres." })
  .max(128, { error: "A senha pode ter no máximo 128 caracteres." });

export const EmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Informe um e-mail válido." }));

export const NameSchema = z.string().trim().min(2, { error: "Informe o nome completo." }).max(120);
