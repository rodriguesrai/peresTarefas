import path from "node:path";

// Pasta onde ficam o banco e o segredo da sessão.
export const DATA_DIR = process.env.PERES_DATA_DIR ?? path.join(process.cwd(), "dados");

export const DATABASE_FILE = path.join(DATA_DIR, "peres-tarefas.db");
