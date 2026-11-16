import "server-only";
import fs from "node:fs";
import path from "node:path";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { DATA_DIR } from "@/lib/paths";

// Token de uso único que libera a configuração inicial. Fica em um arquivo
// em dados/, que só quem tem acesso ao computador do sistema consegue ler.
// O script de inicialização lê esse arquivo e abre o navegador com o token na URL.
export const SETUP_TOKEN_FILE = path.join(DATA_DIR, "setup-token");

export function ensureSetupToken(): string {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  try {
    const token = randomBytes(24).toString("hex");
    fs.writeFileSync(SETUP_TOKEN_FILE, token, { mode: 0o600, flag: "wx" });
    return token;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    return fs.readFileSync(SETUP_TOKEN_FILE, "utf8").trim();
  }
}

export function isValidSetupToken(candidate: unknown): boolean {
  if (typeof candidate !== "string" || candidate.length === 0) return false;
  let expected: string;
  try {
    expected = fs.readFileSync(SETUP_TOKEN_FILE, "utf8").trim();
  } catch {
    return false;
  }
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  return expected.length >= 32 && a.length === b.length && timingSafeEqual(a, b);
}

export function deleteSetupToken() {
  fs.rmSync(SETUP_TOKEN_FILE, { force: true });
}
