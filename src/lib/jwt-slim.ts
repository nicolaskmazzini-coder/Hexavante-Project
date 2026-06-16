import type { JWT } from "next-auth/jwt";

const JWT_KEEP_KEYS = [
  "sub",
  "id",
  "email",
  "name",
  "username",
  "roles",
  "isBanned",
  "banReason",
  "isMuted",
  "isImpersonating",
  "impersonatorId",
  "impersonatorUsername",
  "impersonatorRoles",
  "exp",
  "iat",
  "jti",
] as const;

export function slimJwtToken(token: JWT): JWT {
  const slim: JWT = {};

  for (const key of JWT_KEEP_KEYS) {
    const value = token[key];
    if (value !== undefined && value !== null) {
      (slim as Record<string, unknown>)[key] = value;
    }
  }

  return slim;
}
