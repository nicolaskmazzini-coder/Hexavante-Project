import { prisma } from "@/lib/prisma";

export type ModerationStatus = {
  isBanned: boolean;
  banReason?: string;
  banExpiresAt?: Date | null;
  isMuted: boolean;
  muteReason?: string;
  muteExpiresAt?: Date | null;
};

async function liftExpiredRecords(userId: string) {
  const now = new Date();

  await prisma.userBan.updateMany({
    where: {
      userId,
      isActive: true,
      expiresAt: { lte: now },
    },
    data: { isActive: false, liftedAt: now },
  });

  await prisma.userMute.updateMany({
    where: {
      userId,
      isActive: true,
      expiresAt: { lte: now },
    },
    data: { isActive: false, liftedAt: now },
  });
}

export async function getActiveModerationStatus(userId: string): Promise<ModerationStatus> {
  await liftExpiredRecords(userId);

  const now = new Date();

  const [activeBan, activeMute] = await Promise.all([
    prisma.userBan.findFirst({
      where: {
        userId,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.userMute.findFirst({
      where: {
        userId,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    isBanned: Boolean(activeBan),
    banReason: activeBan?.reason,
    banExpiresAt: activeBan?.expiresAt,
    isMuted: Boolean(activeMute),
    muteReason: activeMute?.reason,
    muteExpiresAt: activeMute?.expiresAt,
  };
}

export async function assertUserCanInteract(userId: string): Promise<void> {
  const status = await getActiveModerationStatus(userId);
  if (status.isMuted) {
    const until = status.muteExpiresAt
      ? ` até ${status.muteExpiresAt.toLocaleString("pt-BR")}`
      : "";
    throw new Error(`Você está silenciado${until} e não pode realizar esta ação.`);
  }
}

export async function assertUserNotBanned(userId: string): Promise<void> {
  const status = await getActiveModerationStatus(userId);
  if (status.isBanned) {
    throw new Error(status.banReason ?? "Sua conta está suspensa.");
  }
}
