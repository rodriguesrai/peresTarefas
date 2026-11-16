import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;

// Formato salvo: "scrypt$<salt hex>$<hash hex>"
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, KEY_LENGTH);
  return ["scrypt", salt.toString("hex"), hash.toString("hex")].join("$");
}

const STORED_FORMAT = /^scrypt\$([0-9a-f]{32})\$([0-9a-f]{128})$/;

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  // Registro fora do formato esperado nunca é aceito.
  const match = STORED_FORMAT.exec(stored);
  if (!match) return false;

  try {
    const salt = Buffer.from(match[1], "hex");
    const expected = Buffer.from(match[2], "hex");
    const actual = await scryptAsync(password, salt, KEY_LENGTH);
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
