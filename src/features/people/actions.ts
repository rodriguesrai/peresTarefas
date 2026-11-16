"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { requireGestor } from "@/features/auth/lib/dal";
import { hashPassword } from "@/features/auth/lib/password";
import { generateTemporaryPassword } from "@/features/auth/lib/temporary-password";
import { PersonSchema, readPersonForm, type PersonFields, type PersonFormValues } from "./schemas";

export type CreatePersonState = {
  errors?: Partial<Record<PersonFields, string[]>>;
  values?: PersonFormValues;
  created?: { name: string; email: string; temporaryPassword: string };
};

export async function createPerson(_state: CreatePersonState, formData: FormData): Promise<CreatePersonState> {
  await requireGestor();

  const values = readPersonForm(formData);
  const parsed = PersonSchema.safeParse(values);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
  if (exists) return { errors: { email: ["Já existe uma pessoa com este e-mail."] }, values };

  const temporaryPassword = generateTemporaryPassword();
  await prisma.user.create({
    data: {
      ...parsed.data,
      passwordHash: await hashPassword(temporaryPassword),
      mustChangePassword: true,
    },
  });

  revalidatePath("/pessoas");
  return { created: { name: parsed.data.name, email: parsed.data.email, temporaryPassword } };
}
