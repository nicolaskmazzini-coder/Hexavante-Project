import { prisma } from "@/lib/prisma";

export async function getUserWallet(userId: string) {
  return prisma.userWallet.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}
