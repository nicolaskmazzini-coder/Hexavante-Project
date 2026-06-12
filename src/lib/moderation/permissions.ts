import { isSuperAdmin as hasSuperAdminRole } from "@/lib/permissions";

export type ModRole = "moderador" | "admin" | "superadmin";

const PERMISSIONS: Record<string, ModRole[]> = {
  addxp: ["moderador", "admin", "superadmin"],
  removexp: ["admin", "superadmin"],
  setxp: ["admin", "superadmin"],
  setlevel: ["admin", "superadmin"],
  addmoedas: ["moderador", "admin", "superadmin"],
  removemoedas: ["admin", "superadmin"],
  setmoedas: ["admin", "superadmin"],
  addcargo: ["admin", "superadmin"],
  removecargo: ["admin", "superadmin"],
  ban: ["moderador", "admin", "superadmin"],
  unban: ["admin", "superadmin"],
  mute: ["moderador", "admin", "superadmin"],
  unmute: ["moderador", "admin", "superadmin"],
  warn: ["moderador", "admin", "superadmin"],
  broadcast: ["admin", "superadmin"],
  manutencao: ["superadmin"],
  boosterglobal: ["admin", "superadmin"],
  impersonate: ["superadmin"],
  resetpass: ["admin", "superadmin"],
  cursos: ["moderador", "admin", "superadmin"],
  simulado: ["moderador", "admin", "superadmin"],
  stats: ["moderador", "admin", "superadmin"],
  logs: ["moderador", "admin", "superadmin"],
  user: ["moderador", "admin", "superadmin"],
};

export function rolesToModRole(roles: string[] | undefined): ModRole | null {
  if (!roles?.length) return null;
  if (roles.includes("SUPERADMIN")) return "superadmin";
  if (roles.includes("ADMIN")) return "admin";
  if (roles.includes("MODERATOR")) return "moderador";
  return null;
}

export function canDo(action: string, roles: string[] | undefined): boolean {
  const modRole = rolesToModRole(roles);
  if (!modRole) return false;
  const allowed = PERMISSIONS[action.toLowerCase()];
  if (!allowed) return modRole === "admin" || modRole === "moderador";
  return allowed.includes(modRole);
}

export function isSuperAdmin(roles: string[] | undefined): boolean {
  return hasSuperAdminRole(roles);
}

export function requireModAction(action: string, roles: string[] | undefined): void {
  if (!canDo(action, roles)) {
    throw new Error(`Sem permissão para executar: ${action}`);
  }
}
