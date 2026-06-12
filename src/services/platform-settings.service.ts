import { prisma } from "@/lib/prisma";

type MaintenanceValue = {
  enabled?: boolean;
  message?: string;
};

type GlobalBoosterValue = {
  multiplier?: number;
  expiresAt?: string;
};

const CACHE_TTL_MS = 30_000;

let maintenanceCache: { value: { enabled: boolean; message: string }; at: number } | null = null;
let boosterCache: {
  value: { active: boolean; multiplier: number; expiresAt: string | null };
  at: number;
} | null = null;

export async function getMaintenanceMode(): Promise<{ enabled: boolean; message: string }> {
  if (maintenanceCache && Date.now() - maintenanceCache.at < CACHE_TTL_MS) {
    return maintenanceCache.value;
  }

  const fallback = {
    enabled: false,
    message: "Estamos em manutenção. Voltamos em breve!",
  };

  try {
    const row = await prisma.platformSetting.findUnique({ where: { key: "maintenance" } });
    const value = (row?.value ?? {}) as MaintenanceValue;

    const result = {
      enabled: Boolean(value.enabled),
      message: value.message?.trim() || fallback.message,
    };

    maintenanceCache = { value: result, at: Date.now() };
    return result;
  } catch {
    return fallback;
  }
}

export async function getGlobalBoosterState(): Promise<{
  active: boolean;
  multiplier: number;
  expiresAt: string | null;
}> {
  if (boosterCache && Date.now() - boosterCache.at < CACHE_TTL_MS) {
    return boosterCache.value;
  }

  const fallback = { active: false, multiplier: 1, expiresAt: null };

  try {
    const row = await prisma.platformSetting.findUnique({ where: { key: "global_booster" } });
    const value = (row?.value ?? {}) as GlobalBoosterValue;
    const expiresAt = value.expiresAt ?? null;
    const active = Boolean(expiresAt && new Date(expiresAt) > new Date());
    const multiplier = active && value.multiplier && value.multiplier > 1 ? value.multiplier : 1;

    const result = { active, multiplier, expiresAt };
    boosterCache = { value: result, at: Date.now() };
    return result;
  } catch {
    return fallback;
  }
}

export async function getGlobalBoosterMultiplier(): Promise<number> {
  const state = await getGlobalBoosterState();
  return state.active ? state.multiplier : 1;
}

export function invalidatePlatformSettingsCache(): void {
  maintenanceCache = null;
  boosterCache = null;
}

export async function getPlatformSettingsSnapshot() {
  const [maintenance, globalBooster] = await Promise.all([
    getMaintenanceMode(),
    getGlobalBoosterState(),
  ]);

  return { maintenance, globalBooster };
}
