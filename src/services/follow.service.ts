import { prisma } from "@/lib/prisma";

export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new Error("Você não pode seguir a si mesmo.");
  }

  const target = await prisma.user.findUnique({ where: { id: followingId }, select: { id: true } });
  if (!target) throw new Error("Usuário não encontrado.");

  await prisma.userFollow.upsert({
    where: {
      followerId_followingId: { followerId, followingId },
    },
    create: { followerId, followingId },
    update: {},
  });
}

export async function unfollowUser(followerId: string, followingId: string) {
  await prisma.userFollow.deleteMany({
    where: { followerId, followingId },
  });
}

export async function isFollowing(followerId: string, followingId: string) {
  const row = await prisma.userFollow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });
  return Boolean(row);
}

export async function getFollowCounts(userId: string) {
  const [followers, following] = await Promise.all([
    prisma.userFollow.count({ where: { followingId: userId } }),
    prisma.userFollow.count({ where: { followerId: userId } }),
  ]);
  return { followers, following };
}

export async function getFollowingIds(userId: string) {
  const rows = await prisma.userFollow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  return rows.map((row) => row.followingId);
}
