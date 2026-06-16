import { COIN_REWARDS, XP_REWARDS } from "@/lib/gamification";

/** Multiplicadores por ordem do dia (1º, 2º, 3º, 4º+). */
export const EXAM_DAILY_REWARD_MULTIPLIERS = [1, 0.35, 0.12, 0.05] as const;

export const EXAM_DAILY_REWARD_LABELS = ["Máxima", "Reduzida", "Baixa", "Mínima"] as const;

/** Simulados com recompensa acima do mínimo fixo (1º, 2º e 3º do dia). */
export const EXAM_DAILY_GOOD_TIER_COUNT = 3;

const SAO_PAULO_OFFSET_MS = 3 * 60 * 60 * 1000;

export function getSaoPauloDayBounds(reference = new Date()) {
  const spInstant = new Date(reference.getTime() - SAO_PAULO_OFFSET_MS);
  const y = spInstant.getUTCFullYear();
  const m = spInstant.getUTCMonth();
  const d = spInstant.getUTCDate();

  const start = new Date(Date.UTC(y, m, d, 3, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, d + 1, 3, 0, 0, 0));

  return { start, end };
}

export function getMultiplierForDailyAttempt(attemptNumber: number): number {
  const index = Math.min(Math.max(attemptNumber, 1) - 1, EXAM_DAILY_REWARD_MULTIPLIERS.length - 1);
  return EXAM_DAILY_REWARD_MULTIPLIERS[index];
}

export function getTierIndexForDailyAttempt(attemptNumber: number): number {
  return Math.min(Math.max(attemptNumber, 1) - 1, EXAM_DAILY_REWARD_MULTIPLIERS.length - 1);
}

export function getDailyRewardTierLabel(attemptNumber: number): string {
  return EXAM_DAILY_REWARD_LABELS[getTierIndexForDailyAttempt(attemptNumber)];
}

export function applyDailyRewardAmount(base: number, multiplier: number): number {
  if (base <= 0) return 0;
  return Math.max(1, Math.round(base * multiplier));
}

export type DailyRewardPreview = {
  completedToday: number;
  nextAttemptNumber: number;
  multiplier: number;
  tierLabel: string;
  goodRewardsRemaining: number;
  xpBase: number;
  xpPassBonus: number;
  coinsPerCorrect: number;
  maxCoinsIfAllCorrect: number;
  resetsAtLabel: string;
};

export function buildDailyRewardPreview(
  completedToday: number,
  mcQuestionCount: number,
): DailyRewardPreview {
  const nextAttemptNumber = completedToday + 1;
  const multiplier = getMultiplierForDailyAttempt(nextAttemptNumber);
  const xpBase = applyDailyRewardAmount(XP_REWARDS.EXAM, multiplier);
  const xpPassBonus = applyDailyRewardAmount(XP_REWARDS.EXAM_PASS_BONUS, multiplier);
  const coinsPerCorrect = applyDailyRewardAmount(COIN_REWARDS.EXAM_CORRECT, multiplier);
  const goodRewardsRemaining = Math.max(0, EXAM_DAILY_GOOD_TIER_COUNT - completedToday);

  return {
    completedToday,
    nextAttemptNumber,
    multiplier,
    tierLabel: getDailyRewardTierLabel(nextAttemptNumber),
    goodRewardsRemaining,
    xpBase,
    xpPassBonus,
    coinsPerCorrect,
    maxCoinsIfAllCorrect: coinsPerCorrect * mcQuestionCount,
    resetsAtLabel: "meia-noite (horário de Brasília)",
  };
}
