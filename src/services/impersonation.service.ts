import { getAuthSecret } from "@/lib/auth-env";
import { isSuperAdmin } from "@/lib/moderation/permissions";
import { prisma } from "@/lib/prisma";
import { writeModerationLog } from "@/services/moderation-admin.service";
import { cookies } from "next/headers";
import { encode, getToken, type JWT } from "next-auth/jwt";

const STAFF_ROLES = new Set(["MODERATOR", "ADMIN", "SUPERADMIN"]);

function getSessionCookieName(): string {
  return process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";
}

export function getRealRolesFromToken(token: JWT | null): string[] {
  if (!token) return [];
  if (token.isImpersonating && Array.isArray(token.impersonatorRoles)) {
    return token.impersonatorRoles as string[];
  }
  return (token.roles as string[]) ?? [];
}

async function loadTargetUser(targetUserId: string) {
  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: { roles: { include: { role: true } } },
  });
  if (!target) throw new Error("Usuário não encontrado.");

  const targetRoles = target.roles.map((r) => r.role.name);
  if (targetRoles.some((role) => STAFF_ROLES.has(role))) {
    throw new Error("Não é permitido impersonar moderadores ou administradores.");
  }

  return target;
}

export async function buildImpersonationToken(
  currentToken: JWT,
  targetUserId: string,
): Promise<JWT> {
  const realRoles = getRealRolesFromToken(currentToken);
  if (!isSuperAdmin(realRoles)) {
    throw new Error("Apenas superadmin pode impersonar usuários.");
  }

  const target = await loadTargetUser(targetUserId);

  const impersonatorId = currentToken.isImpersonating
    ? (currentToken.impersonatorId as string)
    : (currentToken.id as string);
  const impersonatorUsername = currentToken.isImpersonating
    ? (currentToken.impersonatorUsername as string)
    : (currentToken.username as string);
  const impersonatorRoles = currentToken.isImpersonating
    ? (currentToken.impersonatorRoles as string[])
    : ((currentToken.roles as string[]) ?? []);

  return {
    ...currentToken,
    sub: target.id,
    id: target.id,
    email: target.email,
    username: target.username,
    name: target.fullName,
    roles: target.roles.map((r) => r.role.name),
    picture: target.avatarUrl ?? undefined,
    image: target.avatarUrl ?? undefined,
    impersonatorId,
    impersonatorUsername,
    impersonatorRoles,
    isImpersonating: true,
    isBanned: false,
    banReason: undefined,
    isMuted: false,
  };
}

export async function buildStopImpersonationToken(currentToken: JWT): Promise<JWT> {
  if (!currentToken.isImpersonating || !currentToken.impersonatorId) {
    throw new Error("Você não está impersonando nenhum usuário.");
  }

  const admin = await prisma.user.findUnique({
    where: { id: currentToken.impersonatorId as string },
    include: { roles: { include: { role: true } } },
  });
  if (!admin) throw new Error("Sessão de impersonação inválida.");

  return {
    ...currentToken,
    sub: admin.id,
    id: admin.id,
    email: admin.email,
    username: admin.username,
    name: admin.fullName,
    roles: admin.roles.map((r) => r.role.name),
    picture: admin.avatarUrl ?? undefined,
    image: admin.avatarUrl ?? undefined,
    impersonatorId: undefined,
    impersonatorUsername: undefined,
    impersonatorRoles: undefined,
    isImpersonating: false,
  };
}

export async function setAuthToken(token: JWT): Promise<void> {
  const cookieName = getSessionCookieName();
  const encoded = await encode({
    token,
    secret: getAuthSecret(),
    salt: cookieName,
    maxAge: 30 * 24 * 60 * 60,
  });

  const cookieStore = await cookies();
  cookieStore.set(cookieName, encoded, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getRequestToken(request: Request): Promise<JWT | null> {
  return getToken({
    req: request,
    secret: getAuthSecret(),
    salt: getSessionCookieName(),
  });
}

export async function startImpersonation(request: Request, targetUserId: string) {
  const currentToken = await getRequestToken(request);
  if (!currentToken?.id) throw new Error("Não autenticado.");

  const newToken = await buildImpersonationToken(currentToken, targetUserId);
  await setAuthToken(newToken);

  await writeModerationLog({
    moderatorId: newToken.impersonatorId as string,
    targetUserId: newToken.id as string,
    action: "IMPERSONATE",
    description: `Visualizando como @${newToken.username}`,
  });

  return { username: newToken.username as string };
}

export async function stopImpersonation(request: Request) {
  const currentToken = await getRequestToken(request);
  if (!currentToken) throw new Error("Não autenticado.");

  const newToken = await buildStopImpersonationToken(currentToken);
  await setAuthToken(newToken);

  await writeModerationLog({
    moderatorId: newToken.id as string,
    action: "IMPERSONATE",
    description: "Encerrou impersonação",
  });

  return { username: newToken.username as string };
}
