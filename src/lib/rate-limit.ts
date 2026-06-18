/**
 * Rate limiting em memória para Server Actions e Route Handlers.
 *
 * Limitações: o estado reinicia ao reiniciar o processo e não é compartilhado
 * entre instâncias. Para produção multi-instância use Redis.
 *
 * Proteção contra IP spoofing: use apenas o PRIMEIRO endereço de X-Forwarded-For
 * e normalize. Se não estiver atrás de proxy confiável, prefira usar "unknown"
 * como fallback em vez de confiar cegamente no header.
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Limpa entradas expiradas a cada 5 minutos para evitar memory leak
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
if (typeof globalThis !== "undefined" && !("_rlCleanup" in globalThis)) {
  (globalThis as Record<string, unknown>)._rlCleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, CLEANUP_INTERVAL_MS);
}

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

export function rateLimit(identifier: string, options: RateLimitOptions): boolean {
  const { maxRequests, windowMs } = options;
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

/**
 * Extrai o IP do cliente de forma segura.
 * - Pega apenas o primeiro IP de X-Forwarded-For (o mais à esquerda = cliente real
 *   quando atrás de um proxy confiável).
 * - Remove portas IPv6 e normaliza.
 * - Nunca confia cegamente: fallback para "unknown" se inválido.
 */
export function extractClientIp(forwardedFor: string | null, realIp: string | null): string {
  const raw = forwardedFor?.split(",")[0]?.trim() ?? realIp?.trim() ?? "";
  // Aceita IPv4 e IPv6 básicos; descarta qualquer coisa estranha
  if (/^[\d.]{7,15}$/.test(raw) || /^[a-f0-9:]{2,39}$/i.test(raw)) {
    return raw.toLowerCase();
  }
  return "unknown";
}

/** 5 tentativas por minuto por IP — auth (login, registro, reset de senha) */
export function rateLimitAuthAction(ip: string): boolean {
  return rateLimit(`auth:${ip}`, { maxRequests: 5, windowMs: 60_000 });
}

/** 60 requisições por minuto por IP — busca pública */
export function rateLimitSearch(ip: string): boolean {
  return rateLimit(`search:${ip}`, { maxRequests: 60, windowMs: 60_000 });
}

/** 100 requisições por 15 minutos por IP — uso geral */
export function rateLimitByIp(ip: string, action = "default"): boolean {
  return rateLimit(`${action}:${ip}`, { maxRequests: 100, windowMs: 15 * 60_000 });
}
