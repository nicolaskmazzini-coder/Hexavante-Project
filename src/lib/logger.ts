// Tipos de nível de log
// Define os níveis disponíveis para logging
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// Classe Logger para sistema de logging
// Fornece métodos para log em diferentes níveis

class Logger {
  // Verifica se está em ambiente de desenvolvimento
  private isDevelopment = process.env.NODE_ENV === 'development';

  // Formata mensagem de log com timestamp e nível
  private formatMessage(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  // Log de nível info (apenas em desenvolvimento)
  info(message: string, meta?: any) {
    if (this.isDevelopment) {
      console.log(this.formatMessage('info', message, meta));
    }
  }

  // Log de nível warn (sempre)
  warn(message: string, meta?: any) {
    console.warn(this.formatMessage('warn', message, meta));
  }

  // Log de nível error (sempre, com tratamento de erro)
  error(message: string, error?: Error | any, meta?: any) {
    const errorMeta = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      ...meta,
    } : { error, ...meta };
    
    console.error(this.formatMessage('error', message, errorMeta));
  }

  // Log de nível debug (apenas em desenvolvimento)
  debug(message: string, meta?: any) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }
}

// Instância única do logger para uso em toda aplicação
export const logger = new Logger();
