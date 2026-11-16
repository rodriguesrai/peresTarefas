import "server-only";
import { randomInt } from "node:crypto";

// Sem 0/O, 1/l/I: a senha é ditada ou copiada à mão pelo gestor.
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

// Formato "abcd-efgh-jkmn": fácil de ler e com ~59 bits de entropia.
export function generateTemporaryPassword(): string {
  const groups = Array.from({ length: 3 }, () =>
    Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join(""),
  );
  return groups.join("-");
}
