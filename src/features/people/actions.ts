"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { isId } from "@/lib/validate";
import { requireGestor } from "@/features/auth/lib/dal";
import { hashPassword } from "@/features/auth/lib/password";
import { generateTemporaryPassword } from "@/features/auth/lib/temporary-password";
import { PersonSchema, readPersonForm, type PersonFields, type PersonFormValues } from "./schemas";

const LAST_MANAGER = "É preciso manter pelo menos um gestor ativo.";

class LastManagerError extends Error {}

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// Conferido depois da escrita, dentro da transação: se ninguém sobrou
// como gestor ativo, a transação é desfeita.
async function assertActiveManagerRemains(tx: Tx) {
  if ((await tx.user.count({ where: { role: "GESTOR", active: true } })) === 0) {
    throw new LastManagerError();
  }
}

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

export type UpdatePersonState = {
  errors?: Partial<Record<PersonFields, string[]>>;
  values?: PersonFormValues;
  message?: string;
  saved?: boolean;
};

export async function updatePerson(_state: UpdatePersonState, formData: FormData): Promise<UpdatePersonState> {
  const me = await requireGestor();
  const id = formData.get("id");
  if (!isId(id)) return { message: "Pessoa não encontrada." };

  const values = readPersonForm(formData);
  const parsed = PersonSchema.safeParse(values);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };

  const person = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!person) return { message: "Pessoa não encontrada.", values };

  if (id === me.id && parsed.data.role !== "GESTOR") {
    return { message: "Você não pode tirar o seu próprio perfil de gestor.", values };
  }

  const sameEmail = await prisma.user.findFirst({
    where: { email: parsed.data.email, id: { not: id } },
    select: { id: true },
  });
  if (sameEmail) return { errors: { email: ["Já existe uma pessoa com este e-mail."] }, values };

  // Mudança de perfil derruba a sessão atual, que carrega o perfil antigo.
  const roleChanged = person.role !== parsed.data.role;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: { ...parsed.data, ...(roleChanged ? { sessionVersion: { increment: 1 } } : {}) },
      });
      await assertActiveManagerRemains(tx);
    });
  } catch (error) {
    if (error instanceof LastManagerError) return { message: LAST_MANAGER, values };
    throw error;
  }

  revalidatePath("/pessoas");
  return { saved: true, values };
}

export type PersonActionState = { message?: string; ok?: string };

// Desativar mantém o histórico de tarefas e bloqueia o login na hora.
export async function setPersonActive(_state: PersonActionState, formData: FormData): Promise<PersonActionState> {
  const me = await requireGestor();
  const id = formData.get("id");
  const active = formData.get("active") === "1";
  if (!isId(id)) return { message: "Pessoa não encontrada." };
  if (id === me.id && !active) return { message: "Você não pode desativar o seu próprio acesso." };

  const person = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!person) return { message: "Pessoa não encontrada." };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: { active, ...(active ? {} : { sessionVersion: { increment: 1 } }) },
      });
      await assertActiveManagerRemains(tx);
    });
  } catch (error) {
    if (error instanceof LastManagerError) return { message: LAST_MANAGER };
    throw error;
  }

  revalidatePath("/pessoas");
  revalidatePath(`/pessoas/${id}`);
  return { ok: active ? "Acesso reativado." : "Acesso desativado." };
}

export type ResetPasswordState = { message?: string; temporaryPassword?: string };

// Para quem esqueceu a senha: gera uma provisória e encerra as sessões abertas.
export async function resetPersonPassword(_state: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> {
  const me = await requireGestor();
  const id = formData.get("id");
  if (!isId(id)) return { message: "Pessoa não encontrada." };
  if (id === me.id) return { message: "Para a sua própria senha, use \"Alterar senha\" no topo da tela." };

  const person = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!person) return { message: "Pessoa não encontrada." };

  const temporaryPassword = generateTemporaryPassword();
  await prisma.user.update({
    where: { id },
    data: {
      passwordHash: await hashPassword(temporaryPassword),
      mustChangePassword: true,
      sessionVersion: { increment: 1 },
    },
  });

  return { temporaryPassword };
}
