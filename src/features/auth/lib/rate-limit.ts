import "server-only";

// Limita tentativas de login por e-mail. Fica em memória porque o sistema
// roda em um único servidor; reiniciar o sistema zera os contadores.
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

type Entry = { failures: number; firstFailureAt: number };

const attempts = new Map<string, Entry>();

function current(key: string, now: number): Entry | undefined {
  const entry = attempts.get(key);
  if (entry && now - entry.firstFailureAt > WINDOW_MS) {
    attempts.delete(key);
    return undefined;
  }
  return entry;
}

export function isLoginBlocked(key: string, now = Date.now()): boolean {
  return (current(key, now)?.failures ?? 0) >= MAX_FAILURES;
}

export function registerLoginFailure(key: string, now = Date.now()) {
  const entry = current(key, now);
  if (entry) entry.failures += 1;
  else attempts.set(key, { failures: 1, firstFailureAt: now });
}

export function clearLoginFailures(key: string) {
  attempts.delete(key);
}
