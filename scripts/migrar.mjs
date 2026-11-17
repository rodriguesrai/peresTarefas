// Aplica as migrações do banco sem precisar do Prisma CLI.
// Usa a mesma tabela _prisma_migrations do Prisma, então os dois modos convivem.
//
// Uso: node scripts/migrar.mjs [caminho-do-banco] [pasta-de-migrações]
import { createHash, randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const root = path.resolve(here, "..");
const dataDir = process.env.PERES_DATA_DIR ?? path.join(root, "dados");
const dbFile = path.resolve(process.argv[2] ?? path.join(dataDir, "peres-tarefas.db"));
const migrationsDir = path.resolve(process.argv[3] ?? path.join(root, "prisma", "migrations"));

const migrations = fs
  .readdirSync(migrationsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(migrationsDir, entry.name, "migration.sql")))
  .map((entry) => entry.name)
  .sort();

fs.mkdirSync(path.dirname(dbFile), { recursive: true });
const existed = fs.existsSync(dbFile);
const db = new Database(dbFile);

db.exec(`CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                    TEXT PRIMARY KEY NOT NULL,
    "checksum"              TEXT NOT NULL,
    "finished_at"           DATETIME,
    "migration_name"        TEXT NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        DATETIME,
    "started_at"            DATETIME NOT NULL DEFAULT current_timestamp,
    "applied_steps_count"   INTEGER UNSIGNED NOT NULL DEFAULT 0
)`);

const rows = db.prepare(`SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations"`).all();
const failed = rows.find((row) => row.finished_at === null && row.rolled_back_at === null);
if (failed) {
  console.error(`A migração "${failed.migration_name}" falhou antes. Restaure um backup da pasta "backups".`);
  process.exit(1);
}

const applied = new Set(rows.filter((row) => row.rolled_back_at === null).map((row) => row.migration_name));
const pending = migrations.filter((name) => !applied.has(name));

if (pending.length === 0) {
  console.log("Banco de dados em dia.");
  db.close();
  process.exit(0);
}

// Cópia de segurança antes de mexer em um banco que já tem dados.
if (existed && applied.size > 0) {
  const backupDir = path.join(path.dirname(dataDir), "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
  const target = path.join(backupDir, `antes-de-atualizar_${stamp}.db`);
  await db.backup(target);
  console.log(`Cópia de segurança criada: ${target}`);
}

const now = () => Date.now();
const insert = db.prepare(
  `INSERT INTO "_prisma_migrations" (id, checksum, migration_name, started_at, applied_steps_count) VALUES (?, ?, ?, ?, 0)`,
);
const finish = db.prepare(`UPDATE "_prisma_migrations" SET finished_at = ?, applied_steps_count = 1 WHERE id = ?`);

for (const name of pending) {
  const sql = fs.readFileSync(path.join(migrationsDir, name, "migration.sql"));
  const id = randomUUID();
  insert.run(id, createHash("sha256").update(sql).digest("hex"), name, now());
  try {
    db.exec(sql.toString("utf8"));
  } catch (error) {
    db.prepare(`UPDATE "_prisma_migrations" SET logs = ? WHERE id = ?`).run(String(error), id);
    console.error(`Erro ao aplicar a migração ${name}:`, error);
    process.exit(1);
  }
  finish.run(now(), id);
  console.log(`Migração aplicada: ${name}`);
}

db.close();
