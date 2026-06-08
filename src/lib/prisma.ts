// Cliente Prisma singleton — usar após: npm install @prisma/client && npx prisma generate
// Evita múltiplas instâncias em desenvolvimento com hot reload

import { PrismaClient } from "@prisma/client"; // Cliente Prisma para banco de dados

// Define tipo global para armazenar instância do Prisma
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Exporta instância única do Prisma (singleton)
// Usa instância existente em desenvolvimento ou cria nova
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Em desenvolvimento, armazena instância no global para evitar múltiplas conexões
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
