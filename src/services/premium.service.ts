import { PREMIUM_TRIAL_DAYS, buildPremiumStatus, isPremiumActive } from "@/lib/premium";
import { prisma } from "@/lib/prisma";

export async function getPremiumStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true, premiumExpiresAt: true },
  });
  if (!user) return null;
  return buildPremiumStatus(user);
}

export async function canAccessPremiumExam(userId: string, exam: { isPremiumOnly: boolean }) {
  if (!exam.isPremiumOnly) return true;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true, premiumExpiresAt: true },
  });
  if (!user) return false;
  return isPremiumActive(user);
}

export async function activatePremiumTrial(userId: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + PREMIUM_TRIAL_DAYS);

  return prisma.user.update({
    where: { id: userId },
    data: {
      isPremium: true,
      premiumExpiresAt: expiresAt,
    },
    select: {
      isPremium: true,
      premiumExpiresAt: true,
    },
  });
}

export async function deactivateExpiredPremium() {
  const now = new Date();
  await prisma.user.updateMany({
    where: {
      isPremium: true,
      premiumExpiresAt: { lt: now },
    },
    data: { isPremium: false },
  });
}
