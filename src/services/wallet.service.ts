import { prisma } from "@/lib/prisma";

export async function getUserWallet(userId: string) {
  const wallet = await prisma.userWallet.findUnique({ where: { userId } });
  if (wallet) return wallet;

  return prisma.userWallet.create({
    data: { userId },
  });
}
