import { prisma } from "@/lib/prisma";
import { filterProfanity } from "@/lib/profanity-filter";
import { getFollowCounts, isFollowing } from "@/services/follow.service";
import { getUserActivities } from "@/services/social.service";
import { getUserRank, getUserXpProfile } from "@/services/xp.service";
import { getProfileCosmetics } from "@/services/shop.service";
import { listUserEnrollments } from "@/services/student.service";
import { getUserAchievements } from "@/services/achievement.service";
import { getUserCertificates } from "@/services/certificate.service";
import { getProfileShowcase } from "@/services/profile-showcase.service";
import type { ProfileCertificate } from "@/components/profile/profile-certificates-grid";

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

function mapCertificates(
  rows: Awaited<ReturnType<typeof getUserCertificates>>,
): ProfileCertificate[] {
  return rows.map((cert) => ({
    id: cert.id,
    code: cert.code,
    issuedAt: cert.issuedAt,
    courseTitle: cert.course.title,
    categoryName: cert.course.category.name,
  }));
}

export async function getPublicProfile(
  username: string,
  viewer?: { id?: string; username?: string },
) {
  const user = await getUserByUsername(username);
  if (!user) return null;

  const isOwner =
    (viewer?.id != null && viewer.id === user.id) ||
    (viewer?.username != null &&
      viewer.username.toLowerCase() === user.username.toLowerCase());
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
      achievements: [],
      showcase: null,
      certificates: [] as ProfileCertificate[],
    };
  }

  const [xp, rank, followCounts, following, completedCourses, cosmetics, enrollments, activities, achievements, certificateRows] =
    await Promise.all([
      getUserXpProfile(user.id),
      getUserRank(user.id),
      getFollowCounts(user.id),
      viewer?.id && !isOwner ? isFollowing(viewer.id, user.id) : Promise.resolve(false),
      prisma.courseEnrollment.count({
        where: { userId: user.id, progress: { gte: 100 } },
      }),
      getProfileCosmetics(user.id),
      listUserEnrollments(user.id),
      getUserActivities(user.id, viewer?.id, 15),
      getUserAchievements(user.id),
      getUserCertificates(user.id),
    ]);

  const showcase = await getProfileShowcase(user.id, xp, rank);
  const certificates = mapCertificates(certificateRows);

  return {
    user: {
      ...user,
      fullName: filterProfanity(user.fullName),
      bio: user.bio ? filterProfanity(user.bio) : user.bio,
    },
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
    achievements,
    showcase,
    certificates,
  };
}
