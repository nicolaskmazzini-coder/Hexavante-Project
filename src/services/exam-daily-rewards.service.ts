import {
  buildDailyRewardPreview,
  getMultiplierForDailyAttempt,
  getSaoPauloDayBounds,
  type DailyRewardPreview,
} from "@/lib/exam-daily-rewards";
import { prisma } from "@/lib/prisma";

export async function countUserFinishedExamsToday(userId: string, reference = new Date()): Promise<number> {
  const { start, end } = getSaoPauloDayBounds(reference);

  return prisma.examAttempt.count({
    where: {
      userId,
      finishedAt: { gte: start, lt: end },
    },
  });
}

export async function getUserDailyExamRewardStatus(
  userId: string,
  mcQuestionCount: number,
): Promise<DailyRewardPreview> {
  const completedToday = await countUserFinishedExamsToday(userId);
  return buildDailyRewardPreview(completedToday, mcQuestionCount);
}

export async function resolveNextDailyAttemptIndex(userId: string): Promise<{
  dailyAttemptIndex: number;
  dailyRewardMultiplier: number;
}> {
  const completedToday = await countUserFinishedExamsToday(userId);
  const dailyAttemptIndex = completedToday + 1;

  return {
    dailyAttemptIndex,
    dailyRewardMultiplier: getMultiplierForDailyAttempt(dailyAttemptIndex),
  };
}
