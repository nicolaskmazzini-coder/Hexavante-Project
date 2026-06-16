import { prisma } from "@/lib/prisma";

export async function getNavAvatarUrl(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true },
  });
  return user?.avatarUrl ?? null;
}
