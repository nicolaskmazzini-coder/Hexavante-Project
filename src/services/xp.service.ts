// Importações necessárias para o serviço de XP
import {
  applyXp,
  XP_REWARDS,
  XP_SOURCE_LABELS,
  xpProgressPercent,
  xpRequiredForLevel,
} from "@/lib/gamification"; // Funções de gamificação e constantes de XP
import { prisma } from "@/lib/prisma"; // Cliente Prisma para banco de dados
import type { XpSource } from "@prisma/client"; // Tipo de fonte de XP

// Tipo para prêmio de XP
export type XpAward = {
  amount: number; // Quantidade de XP ganho
  description: string; // Descrição do ganho
  leveledUp: boolean; // Se subiu de nível
  newLevel?: number; // Novo nível (se subiu)
};

// Tipo para perfil de XP do usuário
export type UserXpProfile = {
  level: number; // Nível atual
  currentXp: number; // XP atual no nível
  totalXp: number; // XP total acumulado
  xpToNextLevel: number; // XP necessário para próximo nível
  progressPercent: number; // Porcentagem de progresso para próximo nível
};

// Função para obter perfil de XP do usuário
// Retorna perfil completo com nível, XP e progresso
export async function getUserXpProfile(userId: string): Promise<UserXpProfile | null> {
  const xp = await prisma.userXP.findUnique({ where: { userId } });
  if (!xp) return null;

  return {
    level: xp.level,
    currentXp: xp.currentXp,
    totalXp: xp.totalXp,
    xpToNextLevel: xpRequiredForLevel(xp.level),
    progressPercent: xpProgressPercent(xp.level, xp.currentXp),
  };
}

// Função para conceder XP ao usuário
// Adiciona XP, verifica se subiu de nível e cria transação
export async function awardXp(
  userId: string,
  amount: number,
  source: XpSource,
  sourceId: string,
  description?: string,
): Promise<XpAward | null> {
  // Não concede XP se quantidade for inválida
  if (amount <= 0) return null;

  // Usa descrição fornecida ou rótulo padrão da fonte
  const label = description ?? XP_SOURCE_LABELS[source] ?? "XP ganho";

  try {
    return await prisma.$transaction(async (tx) => {
      // Verifica se já existe transação para esta fonte (evita duplicação)
      const existing = await tx.xpTransaction.findUnique({
        where: {
          userId_source_sourceId: { userId, source, sourceId },
        },
      });
      if (existing) return null;

      // Busca ou cria perfil de XP do usuário
      let userXp = await tx.userXP.findUnique({ where: { userId } });
      if (!userXp) {
        userXp = await tx.userXP.create({
          data: { userId },
        });
      }

      // Aplica XP e verifica se subiu de nível
      const updated = applyXp(
        userXp.level,
        userXp.currentXp,
        userXp.totalXp,
        amount,
      );
      const leveledUp = updated.level > userXp.level;

      // Cria registro de transação de XP
      await tx.xpTransaction.create({
        data: {
          userId,
          amount,
          source,
          sourceId,
          description: label,
        },
      });

      // Atualiza perfil de XP do usuário
      await tx.userXP.update({
        where: { userId },
        data: updated,
      });

      return {
        amount,
        description: label,
        leveledUp,
        newLevel: leveledUp ? updated.level : undefined,
      };
    });
  } catch {
    return null;
  }
}

// Função para obter histórico de XP
// Retorna transações de XP mais recentes
export async function getXpHistory(userId: string, limit = 20) {
  return prisma.xpTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }, // Mais recentes primeiro
    take: limit,
  });
}

// Função para obter XP de uma fonte específica
// Retorna transação de XP para uma fonte específica
export async function getXpForSource(
  userId: string,
  source: XpSource,
  sourceId: string,
) {
  return prisma.xpTransaction.findUnique({
    where: {
      userId_source_sourceId: { userId, source, sourceId },
    },
  });
}

// Função para obter ranking
// Retorna usuários ordenados por XP total
export async function getRanking(limit = 50) {
  return prisma.userXP.findMany({
    orderBy: [{ totalXp: "desc" }, { level: "desc" }], // Ordena por XP total e nível
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          fullName: true,
        },
      },
    },
  });
}

// Função para obter posição do usuário no ranking
// Retorna posição do usuário baseada em XP total
export async function getUserRank(userId: string): Promise<number | null> {
  const profile = await getUserXpProfile(userId);
  if (!profile) return null;

  // Conta usuários com mais XP que o usuário
  const ahead = await prisma.userXP.count({
    where: { totalXp: { gt: profile.totalXp } },
  });

  // Posição é número de usuários à frente + 1
  return ahead + 1;
}

// Exporta constantes de recompensas de XP
export { XP_REWARDS };
