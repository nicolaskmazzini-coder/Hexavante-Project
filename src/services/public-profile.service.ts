import { prisma } from "@/lib/prisma";
import { getFollowCounts, isFollowing } from "@/services/follow.service";
import { getUserActivities } from "@/services/social.service";
import { getUserRank, getUserXpProfile } from "@/services/xp.service";
import { getProfileCosmetics } from "@/services/shop.service";
import { listUserEnrollments } from "@/services/student.service";

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      fullName: true,
      bio: true,
      avatarUrl: true,
      profileVisibility: true,
      isPremium: true,
      premiumExpiresAt: true,
      createdAt: true,
    },
  });
}

export async function getPublicProfile(username: string, viewerId?: string) {
  const user = await getUserByUsername(username);
  if (!user) return null;

  const isOwner = viewerId === user.id;
  const isPrivate = user.profileVisibility === "private" && !isOwner;

  if (isPrivate) {
    return {
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        bio: null,
        avatarUrl: null,
        isPremium: false,
      },
      isOwner,
      isPrivate: true,
      xp: null,
      rank: null,
      followCounts: { followers: 0, following: 0 },
      isFollowing: false,
      completedCourses: 0,
      cosmetics: null,
      enrollments: [],
      activities: [],
    };
  }

  const [xp, rank, followCounts, following, completedCourses, cosmetics, enrollments, activities] =
    await Promise.all([
      getUserXpProfile(user.id),
      getUserRank(user.id),
      getFollowCounts(user.id),
      viewerId && !isOwner ? isFollowing(viewerId, user.id) : Promise.resolve(false),
      prisma.courseEnrollment.count({
        where: { userId: user.id, progress: { gte: 100 } },
      }),
      getProfileCosmetics(user.id),
      listUserEnrollments(user.id),
      getUserActivities(user.id, viewerId, 15),
    ]);

  return {
    user,
    isOwner,
    isPrivate: false,
    xp,
    rank,
    followCounts,
    isFollowing: following,
    completedCourses,
    cosmetics,
    enrollments: enrollments.filter((e) => e.progress >= 100).slice(0, 12),
    activities,
  };
}
