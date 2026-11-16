import * as z from "zod";
import { EmailSchema, NameSchema } from "@/features/auth/schemas";

export const PersonSchema = z.object({
  name: NameSchema,
  email: EmailSchema,
  position: z
    .string()
    .trim()
    .max(80, { error: "O cargo pode ter no máximo 80 caracteres." })
    .transform((value) => (value === "" ? null : value)),
  role: z.enum(["GESTOR", "COLABORADOR"], { error: "Escolha o perfil." }),
});

export type PersonFields = "name" | "email" | "position" | "role";

export type PersonFormValues = {
  name?: string;
  email?: string;
  position?: string;
  role?: string;
};

export function readPersonForm(formData: FormData): PersonFormValues {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    position: String(formData.get("position") ?? ""),
    role: String(formData.get("role") ?? ""),
  };
}
