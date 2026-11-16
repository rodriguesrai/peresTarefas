import "server-only";

// Limita tentativas de login por e-mail. Fica em memória porque o sistema
// roda em um único servidor; reiniciar o sistema zera os contadores.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ENTRIES = 1000;

type Entry = { attempts: number; firstAttemptAt: number };

const entries = new Map<string, Entry>();

function sweep(now: number) {
  for (const [key, entry] of entries) {
    if (now - entry.firstAttemptAt > WINDOW_MS) entries.delete(key);
  }
  // Ainda cheio: descarta só quem não está bloqueado, para que encher o
  // contador com e-mails falsos não apague o bloqueio de uma conta atacada.
  for (const [key, entry] of entries) {
    if (entries.size < MAX_ENTRIES) break;
    if (entry.attempts < MAX_ATTEMPTS) entries.delete(key);
  }
}

// Registra a tentativa antes de verificar a senha. Checagem e incremento
// acontecem juntos, sem await no meio, então tentativas simultâneas não escapam.
export function reserveLoginAttempt(key: string, now = Date.now()): boolean {
  let entry = entries.get(key);
  if (entry && now - entry.firstAttemptAt > WINDOW_MS) {
    entries.delete(key);
    entry = undefined;
  }
  if (!entry) {
    if (entries.size >= MAX_ENTRIES) sweep(now);
    // Só com mil contas bloqueadas ao mesmo tempo: recusa até a janela expirar.
    if (entries.size >= MAX_ENTRIES) return false;
    entry = { attempts: 0, firstAttemptAt: now };
    entries.set(key, entry);
  }
  entry.attempts += 1;
  return entry.attempts <= MAX_ATTEMPTS;
}

export function clearLoginAttempts(key: string) {
  entries.delete(key);
}
