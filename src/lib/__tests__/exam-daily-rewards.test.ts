import { describe, expect, it } from "vitest";
import {
  applyDailyRewardAmount,
  buildDailyRewardPreview,
  getMultiplierForDailyAttempt,
  getSaoPauloDayBounds,
} from "@/lib/exam-daily-rewards";

describe("exam-daily-rewards", () => {
  it("aplica queda forte do 1º para o 2º simulado", () => {
    expect(getMultiplierForDailyAttempt(1)).toBe(1);
    expect(getMultiplierForDailyAttempt(2)).toBe(0.35);
    expect(getMultiplierForDailyAttempt(3)).toBe(0.12);
    expect(getMultiplierForDailyAttempt(4)).toBe(0.05);
    expect(getMultiplierForDailyAttempt(10)).toBe(0.05);
  });

  it("calcula valores mínimos fixos no 4º simulado", () => {
    expect(applyDailyRewardAmount(20, 0.05)).toBe(1);
    expect(applyDailyRewardAmount(30, 0.05)).toBe(2);
    expect(applyDailyRewardAmount(5, 0.05)).toBe(1);
  });

  it("monta preview com recompensas boas restantes", () => {
    const preview = buildDailyRewardPreview(1, 10);
    expect(preview.nextAttemptNumber).toBe(2);
    expect(preview.goodRewardsRemaining).toBe(2);
    expect(preview.xpBase).toBe(7);
    expect(preview.coinsPerCorrect).toBe(2);
    expect(preview.maxCoinsIfAllCorrect).toBe(20);
  });

  it("gera intervalo de meia-noite em Brasília", () => {
    const { start, end } = getSaoPauloDayBounds(new Date("2026-06-11T12:00:00Z"));
    expect(end.getTime() - start.getTime()).toBe(24 * 60 * 60 * 1000);
  });
});
