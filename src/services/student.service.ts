import { prisma } from "@/lib/prisma";
import { getUserXpProfile, getXpHistory } from "@/services/xp.service";

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      fullName: true,
      email: true,
      bio: true,
      phone: true,
      city: true,
      state: true,
      profileVisibility: true,
      avatarUrl: true,
    },
  });
}

export async function listUserEnrollments(userId: string) {
  return prisma.courseEnrollment.findMany({
    where: { userId },
    orderBy: { enrolledAt: "desc" },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
          level: true,
          category: { select: { name: true } },
        },
      },
    },
  });
}

export async function getStudentDashboard(userId: string) {
  const [xpProfile, enrollments, recentXp, examAttempts] = await Promise.all([
    getUserXpProfile(userId),
    listUserEnrollments(userId),
    getXpHistory(userId, 3),
    prisma.examAttempt.findMany({
      where: { userId, finishedAt: { not: null } },
      orderBy: { finishedAt: "desc" },
      take: 1,
      select: {
        score: true,
        finishedAt: true,
        exam: { select: { title: true, slug: true } },
      },
    }),
  ]);

  const inProgress = enrollments.filter((e) => e.progress < 100).slice(0, 4);
  const completedCount = enrollments.filter((e) => e.progress >= 100).length;

  return {
    xpProfile,
    enrollments,
    inProgress,
    completedCount,
    recentXp,
    lastExam: examAttempts[0] ?? null,
  };
}
