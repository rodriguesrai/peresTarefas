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
};

let cachedKey: Uint8Array | null = null;

// O segredo é criado na primeira execução e guardado em dados/,
// assim ninguém precisa configurar variável de ambiente.
function getSecretKey(): Uint8Array {
  if (cachedKey) return cachedKey;

  let secret = process.env.SESSION_SECRET;
  if (!secret) {
    const file = path.join(DATA_DIR, "session-secret");
    if (fs.existsSync(file)) {
      secret = fs.readFileSync(file, "utf8").trim();
    } else {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      secret = randomBytes(32).toString("hex");
      fs.writeFileSync(file, secret, { mode: 0o600 });
    }
  }

  cachedKey = new TextEncoder().encode(secret);
  return cachedKey;
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
    if (typeof payload.userId !== "string" || typeof payload.role !== "string") return null;
    return { userId: payload.userId, role: payload.role as Role };
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
    // O sistema roda em http:// na rede local; com "secure" o cookie não seria enviado.
    secure: false,
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
