// Importações necessárias para autenticação
import bcrypt from "bcryptjs"; // Biblioteca para hash de senhas
import { getActiveModerationStatus } from "@/lib/moderation/status";
import { prisma } from "@/lib/prisma"; // Cliente Prisma para banco de dados
import { logger } from "@/lib/logger"; // Sistema de logging
import type { LoginInput, RegisterInput } from "@/lib/validations/auth"; // Tipos de entrada
import {
  enforceCleanContent,
  enforceCleanUsername,
} from "@/services/content-policy.service";
import { ensureDefaultUserCosmetics } from "@/services/shop.service";

// Idade mínima para registro
const MIN_AGE = 13;

// Função para validar idade mínima
// Calcula a idade do usuário e lança erro se for menor que 13 anos
function assertMinimumAge(birthDate: Date) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Ajusta idade se ainda não fez aniversário este ano
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Verifica se tem idade mínima
  if (age < MIN_AGE) {
    throw new Error("É necessário ter no mínimo 13 anos para se cadastrar.");
  }
}

export async function registerUser(data: RegisterInput) {
  assertMinimumAge(data.birthDate);

  await enforceCleanUsername({
    username: data.username,
    identifier: data.email,
  });
  await enforceCleanContent({
    text: data.fullName,
    fieldLabel: "nome",
    context: "REGISTER",
    identifier: data.email,
  });

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { username: data.username }],
    },
  });

  if (existing) {
    logger.warn("Tentativa de registro com dados duplicados", {
      email: data.email,
      username: data.username,
    });
    if (existing.email === data.email) {
      throw new Error("Este e-mail já está em uso.");
    }
    throw new Error("Este nome de usuário já está em uso.");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const userRole = await prisma.role.findUnique({ where: { name: "USER" } });

  if (!userRole) {
    throw new Error("Papel USER não encontrado. Execute o seed do banco.");
  }

  const user = await prisma.user.create({
    data: {
      username: data.username,
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      birthDate: data.birthDate,
      roles: {
        create: { roleId: userRole.id },
      },
      xp: {
        create: {},
      },
      wallet: {
        create: {},
      },
    },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
    },
  });

  logger.info("Usuário registrado com sucesso", { userId: user.id, email: user.email });
  await ensureDefaultUserCosmetics(user.id);
  return user;
}

// Função para validar credenciais de login
// Busca usuário, verifica senha e atualiza último login
export async function validateCredentials(data: LoginInput) {
  // Busca usuário pelo email com roles
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: {
      roles: {
        include: { role: true },
      },
    },
  });

  // Verifica se usuário existe e tem senha
  if (!user?.passwordHash) {
    return null;
  }

  // Compara senha com hash
  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) {
    logger.warn("Tentativa de login com senha inválida", { email: data.email });
    return null;
  }

  const moderationStatus = await getActiveModerationStatus(user.id);
  if (moderationStatus.isBanned) {
    logger.warn("Tentativa de login com conta suspensa", { email: data.email, userId: user.id });
    return null;
  }

  // Atualiza último login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  logger.info("Login realizado com sucesso", { userId: user.id, email: user.email });

  // Retorna dados do usuário para sessão
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    username: user.username,
    roles: user.roles.map((r) => r.role.name),
  };
}

export async function ensureUserProvisioned(userId: string) {
  const userRole = await prisma.role.findUnique({ where: { name: "USER" } });
  if (!userRole) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: true,
      xp: true,
      wallet: true,
    },
  });

  if (!user) return;

  await prisma.$transaction(async (tx) => {
    if (user.roles.length === 0) {
      await tx.userRole.create({
        data: { userId, roleId: userRole.id },
      });
    }

    if (!user.xp) {
      await tx.userXP.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });
    }

    if (!user.wallet) {
      await tx.userWallet.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });
    }
  });

  await ensureDefaultUserCosmetics(userId);
}
