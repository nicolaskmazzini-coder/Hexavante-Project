// Mapa para armazenar contagem de requisições por identificador
const requests = new Map<string, { count: number; resetTime: number }>();

// Opções de configuração para rate limiting
interface RateLimitOptions {
  maxRequests: number; // Número máximo de requisições permitidas
  windowMs: number; // Janela de tempo em milissegundos
}

// Função principal de rate limiting
// Retorna true se requisição for permitida, false se limite foi excedido
export function rateLimit(identifier: string, options: RateLimitOptions): boolean {
  const { maxRequests, windowMs } = options;
  const now = Date.now();
  
  const record = requests.get(identifier);
  
  // Se não existe registro ou janela expirou, cria novo
  if (!record || now > record.resetTime) {
    requests.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }
  
  // Se limite foi excedido, bloqueia requisição
  if (record.count >= maxRequests) {
    return false;
  }
  
  // Incrementa contagem e permite requisição
  record.count++;
  return true;
}

// Função de rate limiting por IP para ações gerais
// Limita a 100 requisições por IP em 15 minutos
export function rateLimitByIp(ip: string, action: string = 'default'): boolean {
  const identifier = `${ip}:${action}`;
  return rateLimit(identifier, {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutos
  });
}

// Função de rate limiting para ações de autenticação
// Limita a 5 tentativas por IP em 1 minuto
export function rateLimitAuthAction(ip: string): boolean {
  const identifier = `${ip}:auth`;
  return rateLimit(identifier, {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minuto
  });
}
