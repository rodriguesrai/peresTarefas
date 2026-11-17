// Abre o sistema (versão de produção) usando os dados de exemplo em http://localhost:3010,
// sem tocar no banco real em dados/ e sem conflitar com o "npm run dev".
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const root = path.resolve(here, "..");
const dataDir = path.join(root, "dados-exemplo");
const appDir = path.join(root, ".next", "standalone");
const port = process.env.PERES_PORTA ?? "3010";

if (!fs.existsSync(path.join(dataDir, "peres-tarefas.db"))) {
  console.error("Crie os dados primeiro: npm run exemplo");
  process.exit(1);
}

if (!fs.existsSync(path.join(appDir, "server.js"))) {
  console.log("Gerando a versão de produção (só na primeira vez)...");
  const npmCli = process.env.npm_execpath;
  execFileSync(process.execPath, [npmCli, "run", "build"], { cwd: root, stdio: "inherit" });
}

// O build standalone não inclui os arquivos estáticos.
fs.cpSync(path.join(root, ".next", "static"), path.join(appDir, ".next", "static"), { recursive: true });
if (fs.existsSync(path.join(root, "public"))) {
  fs.cpSync(path.join(root, "public"), path.join(appDir, "public"), { recursive: true });
}

console.log(`Dados de exemplo em http://localhost:${port}  (senha de todos: demo1234)`);
const child = spawn(process.execPath, ["server.js"], {
  cwd: appDir,
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "production", PORT: port, HOSTNAME: "127.0.0.1", PERES_DATA_DIR: dataDir },
});
child.on("exit", (code) => process.exit(code ?? 0));
