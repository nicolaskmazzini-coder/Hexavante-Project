import { buildPremiumStatus } from "@/lib/premium";
import { prisma } from "@/lib/prisma";
import { getGlobalBoosterMultiplier } from "@/services/platform-settings.service";

export type BoosterState = {
  active: boolean;
  multiplier: number;
  expiresAt: Date | null;
  remainingMs: number;
};

export async function clearExpiredBooster(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { boosterExpiresAt: true, boosterMultiplier: true },
  });

  if (!user?.boosterExpiresAt) return;
  if (user.boosterExpiresAt > new Date()) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      boosterMultiplier: 1.0,
      boosterExpiresAt: null,
    },
  });
}

export async function getBoosterState(userId: string): Promise<BoosterState> {
  await clearExpiredBooster(userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { boosterMultiplier: true, boosterExpiresAt: true },
  });

  if (!user?.boosterExpiresAt || user.boosterExpiresAt <= new Date()) {
    return {
      active: false,
      multiplier: 1,
      expiresAt: null,
      remainingMs: 0,
    };
  }

  return {
    active: true,
    multiplier: user.boosterMultiplier > 1 ? user.boosterMultiplier : 1,
    expiresAt: user.boosterExpiresAt,
    remainingMs: Math.max(0, user.boosterExpiresAt.getTime() - Date.now()),
  };
}

export async function activateBooster(
  userId: string,
  multiplier: number,
  durationHours: number,
): Promise<BoosterState> {
  const hours = Math.max(1, durationHours);
  const durationMs = hours * 60 * 60 * 1000;
  const now = Date.now();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { boosterMultiplier: true, boosterExpiresAt: true },
  });

  const currentExpiry = user?.boosterExpiresAt?.getTime() ?? 0;
  const baseTime = currentExpiry > now ? currentExpiry : now;
  const newExpiry = new Date(baseTime + durationMs);
  const newMultiplier = Math.max(user?.boosterMultiplier ?? 1, multiplier);

  await prisma.user.update({
    where: { id: userId },
    data: {
      boosterMultiplier: newMultiplier,
      boosterExpiresAt: newExpiry,
    },
  });

  return {
    active: true,
    multiplier: newMultiplier,
    expiresAt: newExpiry,
    remainingMs: newExpiry.getTime() - now,
  };
}

export async function getTotalRewardMultiplier(userId: string): Promise<{
  total: number;
  premium: number;
  booster: number;
  global: number;
  boosterExpiresAt: Date | null;
}> {
  const [user, booster, globalMult] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true, premiumExpiresAt: true },
    }),
    getBoosterState(userId),
    getGlobalBoosterMultiplier(),
  ]);

  const premium = user ? buildPremiumStatus(user).coinMultiplier : 1;
  const boosterMult = booster.active ? booster.multiplier : 1;
  const combinedBooster = boosterMult * globalMult;

  return {
    total: premium * combinedBooster,
    premium,
    booster: combinedBooster,
    global: globalMult,
    boosterExpiresAt: booster.expiresAt,
  };
}
