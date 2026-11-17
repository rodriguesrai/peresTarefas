// Gera uma senha provisória para uma pessoa, direto no banco.
// Serve para quando o gestor esquece a senha e não há outro gestor para ajudar.
// Só funciona no computador onde o sistema está instalado.
//
// Uso: node scripts/recuperar-acesso.mjs email@exemplo.com
import { createRequire } from "node:module";
import { randomBytes, randomInt, scryptSync } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const dataDir = process.env.PERES_DATA_DIR ?? path.join(path.resolve(here, ".."), "dados");
const dbFile = path.join(dataDir, "peres-tarefas.db");
const email = (process.argv[2] ?? "").trim().toLowerCase();

if (!fs.existsSync(dbFile)) {
  console.error("Banco de dados não encontrado. Abra o sistema ao menos uma vez.");
  process.exit(1);
}

const db = new Database(dbFile);

if (!email) {
  console.log("Pessoas cadastradas:");
  for (const row of db.prepare("SELECT name, email, role, active FROM User ORDER BY name").all()) {
    console.log(`  ${row.email}  (${row.name}${row.role === "GESTOR" ? ", gestor" : ""}${row.active ? "" : ", inativo"})`);
  }
  process.exit(0);
}

const user = db.prepare("SELECT id, name FROM User WHERE email = ?").get(email);
if (!user) {
  console.error(`Nenhuma pessoa cadastrada com o e-mail ${email}.`);
  process.exit(1);
}

// Mesmo formato de senha e de hash usados pelo sistema.
const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
const password = Array.from({ length: 3 }, () =>
  Array.from({ length: 4 }, () => alphabet[randomInt(alphabet.length)]).join(""),
).join("-");
const salt = randomBytes(16);
const hash = ["scrypt", salt.toString("hex"), scryptSync(password, salt, 64).toString("hex")].join("$");

// Reativa a pessoa, exige troca de senha e encerra as sessões abertas.
db.prepare(
  `UPDATE User SET passwordHash = ?, mustChangePassword = 1, active = 1,
   sessionVersion = sessionVersion + 1, updatedAt = ? WHERE id = ?`,
).run(hash, new Date().toISOString().replace("Z", "+00:00"), user.id);
db.close();

console.log("");
console.log(`Nova senha provisória de ${user.name}:`);
console.log("");
console.log(`    ${password}`);
console.log("");
console.log("Entre no sistema com o e-mail e esta senha. Ele vai pedir para criar uma senha nova.");
