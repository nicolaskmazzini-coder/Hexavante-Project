import { prisma } from "@/lib/prisma";
import { EXAM_PASS_SCORE } from "@/lib/gamification";
import { ACHIEVEMENT_DEFINITIONS } from "@/lib/achievements";
import { getUserRank, getUserXpProfile } from "@/services/xp.service";
import { getUnlockedAchievementCount } from "@/services/achievement.service";

export type PersonalStats = {
  level: number;
  totalXp: number;
  xpToNextLevel: number;
  progressPercent: number;
  rank: number | null;
  coins: number;
  coursesEnrolled: number;
  coursesCompleted: number;
  lessonsCompleted: number;
  examsTaken: number;
  examsPassed: number;
  averageExamScore: number | null;
  certificatesCount: number;
  achievementsUnlocked: number;
  achievementsTotal: number;
  xpThisWeek: number;
  activeDays: number;
  studyStreakDays: number;
};

function countConsecutiveDays(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const uniqueDays = [
    ...new Set(dates.map((d) => d.toISOString().slice(0, 10))),
  ].sort()
    .reverse();

  let streak = 1;
  const today = new Date().toISOString().slice(0, 10);
  if (uniqueDays[0] !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (uniqueDays[0] !== yesterday.toISOString().slice(0, 10)) return 0;
  }

  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }

  return streak;
}

export async function getPersonalStats(userId: string): Promise<PersonalStats> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [
    xpProfile,
    rank,
    user,
    coursesEnrolled,
    coursesCompleted,
    lessonsCompleted,
    examsTaken,
    examsPassed,
    examScores,
    certificatesCount,
    achievementsUnlocked,
    xpThisWeek,
    activityDates,
  ] = await Promise.all([
    getUserXpProfile(userId),
    getUserRank(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { coins: true, lastStudyAt: true } }),
    prisma.courseEnrollment.count({ where: { userId } }),
    prisma.courseEnrollment.count({ where: { userId, progress: { gte: 100 } } }),
    prisma.lessonProgress.count({ where: { userId, completed: true } }),
    prisma.examAttempt.count({ where: { userId, finishedAt: { not: null } } }),
    prisma.examAttempt.count({
      where: { userId, finishedAt: { not: null }, score: { gte: EXAM_PASS_SCORE } },
    }),
    prisma.examAttempt.findMany({
      where: { userId, finishedAt: { not: null } },
      select: { score: true },
    }),
    prisma.certificate.count({ where: { userId } }),
    getUnlockedAchievementCount(userId),
    prisma.xpTransaction.aggregate({
      where: { userId, createdAt: { gte: weekAgo } },
      _sum: { amount: true },
    }),
    prisma.xpTransaction.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 90,
    }),
  ]);

  const averageExamScore =
    examScores.length > 0
      ? examScores.reduce((sum, e) => sum + e.score, 0) / examScores.length
      : null;

  const dates = activityDates.map((t) => t.createdAt);
  if (user?.lastStudyAt) dates.push(user.lastStudyAt);

  const activeDays = new Set(dates.map((d) => d.toISOString().slice(0, 10))).size;

  return {
    level: xpProfile?.level ?? 1,
    totalXp: xpProfile?.totalXp ?? 0,
    xpToNextLevel: xpProfile?.xpToNextLevel ?? 100,
    progressPercent: xpProfile?.progressPercent ?? 0,
    rank,
    coins: user?.coins ?? 0,
    coursesEnrolled,
    coursesCompleted,
    lessonsCompleted,
    examsTaken,
    examsPassed,
    averageExamScore,
    certificatesCount,
    achievementsUnlocked,
    achievementsTotal: ACHIEVEMENT_DEFINITIONS.length,
    xpThisWeek: xpThisWeek._sum.amount ?? 0,
    activeDays,
    studyStreakDays: countConsecutiveDays(dates),
  };
}
