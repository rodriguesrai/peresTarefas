import "server-only";
import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { DATA_DIR } from "@/lib/paths";
import type { Role } from "@/generated/prisma/enums";

const COOKIE_NAME = "pt_session";
const SESSION_DAYS = 7;

export type SessionPayload = {
  userId: string;
  role: Role;
  sessionVersion: number;
};

let cachedKey: Uint8Array | null = null;

// O segredo é criado na primeira execução e guardado em dados/,
// assim ninguém precisa configurar variável de ambiente.
function getSecretKey(): Uint8Array {
  if (cachedKey) return cachedKey;

  const secret = process.env.SESSION_SECRET ?? readOrCreateSecretFile();
  if (Buffer.byteLength(secret) < 32) {
    throw new Error("SESSION_SECRET precisa ter pelo menos 32 caracteres.");
  }

  cachedKey = new TextEncoder().encode(secret);
  return cachedKey;
}

function readOrCreateSecretFile(): string {
  const file = path.join(DATA_DIR, "session-secret");
  fs.mkdirSync(DATA_DIR, { recursive: true });
  try {
    // "wx" falha se o arquivo já existir, evitando sobrescrever um segredo em uso.
    const secret = randomBytes(32).toString("hex");
    fs.writeFileSync(file, secret, { mode: 0o600, flag: "wx" });
    return secret;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    return fs.readFileSync(file, "utf8").trim();
  }
}

async function encrypt(payload: SessionPayload, expiresAt: Date) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecretKey());
}

async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"] });
    const { userId, role, sessionVersion } = payload;
    if (typeof userId !== "string" || typeof role !== "string" || typeof sessionVersion !== "number") {
      return null;
    }
    return { userId, role: role as Role, sessionVersion };
  } catch {
    return null;
  }
}

export async function createSession(payload: SessionPayload) {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const token = await encrypt(payload, expiresAt);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    // Por padrão o sistema roda em http:// na rede local, onde um cookie "secure"
    // não seria enviado. Quem publicar com HTTPS deve definir COOKIE_SECURE=1.
    secure: process.env.COOKIE_SECURE === "1",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function readSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return decrypt(cookieStore.get(COOKIE_NAME)?.value);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
