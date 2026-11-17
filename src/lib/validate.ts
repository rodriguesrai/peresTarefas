import "server-only";

// Argumentos de server actions chegam do navegador e podem ser forjados:
// um "id" poderia vir como objeto de filtro do Prisma. Só aceita texto curto.
export function isId(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9]{10,40}$/i.test(value);
}
