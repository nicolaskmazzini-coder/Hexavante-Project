// Importações necessárias para geração de códigos de certificado
import crypto from 'crypto'; // Módulo crypto para geração de valores aleatórios

// Função para gerar código único de certificado
// Gera código no formato HEX-{timestamp}-{random}
export function generateCertificateCode(): string {
  const timestamp = Date.now().toString(36); // Timestamp em base 36
  const random = crypto.randomBytes(4).toString('hex').toUpperCase(); // 4 bytes aleatórios em hex
  return `HEX-${timestamp}-${random}`;
}

// Função para verificar formato de código de certificado
// Verifica se código segue o padrão esperado
export function verifyCertificateCode(code: string): boolean {
  return /^HEX-[a-z0-9]+-[A-F0-9]{8}$/.test(code);
}
