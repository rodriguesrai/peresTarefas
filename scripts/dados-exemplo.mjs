// Cria um banco de demonstração com equipe fictícia e tarefas em vários estados,
// para apresentações, prints e avaliação do protótipo.
// Fica em uma pasta separada (dados-exemplo/), nunca no banco real do escritório.
//
// Uso: npm run exemplo            (cria dados-exemplo/)
//      npm run exemplo:abrir      (abre o sistema com esses dados em http://localhost:3010)
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { randomBytes, scryptSync } from "node:crypto";
import path from "node:path";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const root = path.resolve(here, "..");
const dataDir = path.resolve(process.argv[2] ?? path.join(root, "dados-exemplo"));
const dbFile = path.join(dataDir, "peres-tarefas.db");

if (path.resolve(dataDir) === path.join(root, "dados")) {
  console.error("Os dados de exemplo não podem ir para a pasta dados/ (banco real).");
  process.exit(1);
}

// Cria as tabelas com o mesmo aplicador de migrações do sistema.
execFileSync(process.execPath, [path.join(here, "migrar.mjs"), dbFile], { stdio: "inherit" });

const db = new Database(dbFile);
if (db.prepare("SELECT COUNT(*) AS n FROM User").get().n > 0) {
  console.error(`Já existem dados em ${dbFile}. Apague a pasta para recriar.`);
  process.exit(1);
}

const DAY = 24 * 60 * 60 * 1000;
const iso = (date) => date.toISOString().replace("Z", "+00:00");
// "Hoje" no fuso de Brasília, no formato em que o sistema guarda prazos (meia-noite UTC).
const todayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
const today = new Date(`${todayKey}T00:00:00.000Z`);
const due = (days) => iso(new Date(today.getTime() + days * DAY));
// Momento no passado, em horário comercial de Brasília (12h UTC = 9h).
const at = (daysAgo, hour = 9, minute = 0) =>
  new Date(today.getTime() - daysAgo * DAY + (hour + 3) * 60 * 60 * 1000 + minute * 60 * 1000);

const PASSWORD = "demo1234";
const hash = (password) => {
  const salt = randomBytes(16);
  return ["scrypt", salt.toString("hex"), scryptSync(password, salt, 64).toString("hex")].join("$");
};

let seq = 0;
const id = (prefix) => `${prefix}${String(++seq).padStart(24 - prefix.length, "0")}`;

// ------------------------------------------------------------ Equipe
const people = [
  { key: "helena", name: "Helena Duarte", email: "helena@exemplo.local", position: "Sócia", role: "GESTOR" },
  { key: "marcos", name: "Marcos Lima", email: "marcos@exemplo.local", position: "Advogado", role: "GESTOR" },
  { key: "juliana", name: "Juliana Rocha", email: "juliana@exemplo.local", position: "Advogada", role: "COLABORADOR" },
  { key: "pedro", name: "Pedro Alves", email: "pedro@exemplo.local", position: "Estagiário", role: "COLABORADOR" },
  { key: "camila", name: "Camila Souza", email: "camila@exemplo.local", position: "Secretária", role: "COLABORADOR" },
  { key: "rafael", name: "Rafael Nunes", email: "rafael@exemplo.local", position: "Ex-estagiário", role: "COLABORADOR", inactive: true },
];

const insertUser = db.prepare(`INSERT INTO User
  (id, name, email, passwordHash, position, role, active, mustChangePassword, sessionVersion, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`);
const uid = {};
for (const person of people) {
  uid[person.key] = id("demo");
  const created = iso(at(40));
  insertUser.run(uid[person.key], person.name, person.email, hash(PASSWORD), person.position, person.role,
    person.inactive ? 0 : 1, created, created);
}

// ------------------------------------------------------------ Tarefas
// dueIn: dias a partir de hoje (negativo = vencido). createdAgo: dias atrás.
// notes: [autor, dias atrás, hora, texto]
const STATUS = { PENDENTE: "Pendente", EM_ANDAMENTO: "Em andamento", CONCLUIDA: "Concluída" };
const tasks = [
  // Atrasadas
  { title: "Protocolar contestação – processo trabalhista Ferreira", assignee: "juliana", by: "helena", priority: "URGENTE", status: "EM_ANDAMENTO", dueIn: -2, createdAgo: 9,
    description: "Prazo de 15 dias a partir da citação. Usar o modelo de contestação da pasta do cliente.",
    notes: [["juliana", 5, 10, "status:PENDENTE:EM_ANDAMENTO"], ["juliana", 4, 16, "Minuta pronta, aguardando os holerites que o cliente ficou de mandar."], ["helena", 1, 9, "Juliana, conseguiu os holerites? O prazo venceu anteontem, vamos priorizar."]] },
  { title: "Juntar procuração e documentos – inventário família Matos", assignee: "pedro", by: "marcos", priority: "ALTA", status: "PENDENTE", dueIn: -1, createdAgo: 6,
    description: "Certidões de óbito e de casamento, RG e CPF dos herdeiros.",
    notes: [["pedro", 3, 14, "Faltam a certidão de casamento e o RG de um dos herdeiros."]] },
  { title: "Retornar ligação do cliente Souza sobre acordo", assignee: "marcos", by: "helena", priority: "MEDIA", status: "PENDENTE", dueIn: -3, createdAgo: 5 },
  // Vencem hoje e nos próximos dias
  { title: "Audiência de conciliação – revisão de contrato Lopes", assignee: "helena", by: "helena", priority: "URGENTE", status: "EM_ANDAMENTO", dueIn: 0, createdAgo: 20,
    description: "Fórum Central, sala 4, às 14h. Levar a proposta de acordo impressa.",
    notes: [["helena", 2, 11, "status:PENDENTE:EM_ANDAMENTO"], ["helena", 2, 11, "Proposta revisada com o cliente por telefone."]] },
  { title: "Enviar contrato de honorários para assinatura digital", assignee: "camila", by: "helena", priority: "ALTA", status: "PENDENTE", dueIn: 1, createdAgo: 2 },
  { title: "Elaborar parecer sobre rescisão contratual – empresa Vieira", assignee: "juliana", by: "marcos", priority: "ALTA", status: "EM_ANDAMENTO", dueIn: 2, createdAgo: 7,
    notes: [["juliana", 3, 9, "status:PENDENTE:EM_ANDAMENTO"], ["juliana", 1, 17, "Pesquisa de jurisprudência feita, começando a redação."]] },
  { title: "Agendar perícia médica – processo previdenciário Santos", assignee: "camila", by: "marcos", priority: "MEDIA", status: "PENDENTE", dueIn: 3, createdAgo: 4 },
  // Mais para frente
  { title: "Preparar recurso de apelação – ação de cobrança Pereira", assignee: "marcos", by: "helena", priority: "ALTA", status: "PENDENTE", dueIn: 8, createdAgo: 3,
    description: "Sentença publicada. Avaliar com a Helena os pontos do recurso antes de redigir." },
  { title: "Atualizar planilha de prazos do mês", assignee: "pedro", by: "helena", priority: "BAIXA", status: "PENDENTE", dueIn: 6, createdAgo: 1 },
  { title: "Revisar minuta de acordo extrajudicial – condomínio Jardins", assignee: "juliana", by: "helena", priority: "MEDIA", status: "PENDENTE", dueIn: 10, createdAgo: 2 },
  { title: "Pesquisar jurisprudência sobre dano moral em atraso de voo", assignee: "pedro", by: "juliana", priority: "BAIXA", status: "EM_ANDAMENTO", dueIn: 12, createdAgo: 6,
    notes: [["pedro", 2, 15, "status:PENDENTE:EM_ANDAMENTO"]] },
  { title: "Renovar certificado digital do escritório", assignee: "camila", by: "helena", priority: "MEDIA", status: "PENDENTE", dueIn: 20, createdAgo: 3 },
  // Sem prazo
  { title: "Organizar arquivo físico de processos encerrados", assignee: "pedro", by: "helena", priority: "BAIXA", status: "PENDENTE", dueIn: null, createdAgo: 15 },
  { title: "Montar modelo padrão de petição inicial", assignee: "juliana", by: "helena", priority: "BAIXA", status: "PENDENTE", dueIn: null, createdAgo: 12 },
  // Concluídas nos últimos dias
  { title: "Cadastrar novo cliente – Construtora Horizonte", assignee: "camila", by: "helena", priority: "MEDIA", status: "CONCLUIDA", dueIn: -1, createdAgo: 4, doneAgo: 1,
    notes: [["camila", 1, 10, "status:PENDENTE:CONCLUIDA"], ["camila", 1, 10, "Ficha cadastral e contrato arquivados na pasta do cliente."]] },
  { title: "Protocolar petição de juntada – processo Almeida", assignee: "pedro", by: "marcos", priority: "ALTA", status: "CONCLUIDA", dueIn: -2, createdAgo: 6, doneAgo: 3,
    notes: [["pedro", 4, 9, "status:PENDENTE:EM_ANDAMENTO"], ["pedro", 3, 16, "status:EM_ANDAMENTO:CONCLUIDA"], ["pedro", 3, 16, "Protocolado. Comprovante salvo na pasta do processo."]] },
  { title: "Calcular custas iniciais – ação indenizatória Costa", assignee: "juliana", by: "marcos", priority: "MEDIA", status: "CONCLUIDA", dueIn: 0, createdAgo: 5, doneAgo: 2,
    notes: [["juliana", 2, 11, "status:PENDENTE:CONCLUIDA"]] },
  { title: "Reunião de alinhamento semanal da equipe", assignee: "helena", by: "helena", priority: "MEDIA", status: "CONCLUIDA", dueIn: -4, createdAgo: 7, doneAgo: 4 },
  // Concluída há mais tempo e de quem saiu do escritório
  { title: "Digitalizar documentos do cliente Barbosa", assignee: "rafael", by: "helena", priority: "BAIXA", status: "CONCLUIDA", dueIn: -25, createdAgo: 35, doneAgo: 26 },
];

const insertTask = db.prepare(`INSERT INTO Task
  (id, title, description, status, priority, dueDate, completedAt, createdAt, updatedAt, assigneeId, createdById)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const insertNote = db.prepare(`INSERT INTO TaskNote (id, content, createdAt, taskId, authorId) VALUES (?, ?, ?, ?, ?)`);

for (const task of tasks) {
  const taskId = id("demotask");
  const created = iso(at(task.createdAgo, 9, 30));
  const completed = task.doneAgo !== undefined ? iso(at(task.doneAgo, 16, 0)) : null;
  insertTask.run(taskId, task.title, task.description ?? null, task.status, task.priority,
    task.dueIn === null ? null : due(task.dueIn), completed, created, completed ?? created, uid[task.assignee], uid[task.by]);

  for (const [author, daysAgo, hour, text] of task.notes ?? []) {
    // "status:DE:PARA" vira a mesma frase que o sistema registra sozinho.
    const content = text.startsWith("status:")
      ? (([, from, to]) => `Status alterado de "${STATUS[from]}" para "${STATUS[to]}".`)(text.split(":"))
      : text;
    insertNote.run(id("demonote"), content, iso(at(daysAgo, hour, 5)), taskId, uid[author]);
  }
}
db.close();

console.log("");
console.log(`Dados de exemplo criados em ${dataDir}`);
console.log(`${people.length} pessoas e ${tasks.length} tarefas.`);
console.log("");
console.log(`Todos entram com a senha: ${PASSWORD}`);
for (const person of people) {
  const role = person.role === "GESTOR" ? "gestor" : "colaborador";
  console.log(`  ${person.email.padEnd(24)} ${person.name} (${role}${person.inactive ? ", inativo" : ""})`);
}
console.log("");
console.log("Para abrir: npm run exemplo:abrir  ->  http://localhost:3010");
