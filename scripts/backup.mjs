// Cria uma cópia do banco em backups/. Pode rodar com o sistema aberto:
// a cópia "online" do SQLite garante um arquivo consistente.
//
// Uso: node scripts/backup.mjs
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const dataDir = process.env.PERES_DATA_DIR ?? path.join(path.resolve(here, ".."), "dados");
const dbFile = path.join(dataDir, "peres-tarefas.db");
const backupDir = process.env.PERES_BACKUP_DIR ?? path.join(path.dirname(dataDir), "backups");

if (!fs.existsSync(dbFile)) {
  console.error("Ainda não existe banco de dados para copiar. Abra o sistema ao menos uma vez.");
  process.exit(1);
}

fs.mkdirSync(backupDir, { recursive: true });
const pad = (n) => String(n).padStart(2, "0");
const d = new Date();
const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
const target = path.join(backupDir, `peres-tarefas_${stamp}.db`);

const db = new Database(dbFile, { readonly: true });
await db.backup(target);
db.close();

console.log("Backup criado com sucesso:");
console.log(target);
