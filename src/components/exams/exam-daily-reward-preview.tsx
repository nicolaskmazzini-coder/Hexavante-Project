import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { DailyRewardPreview } from "@/lib/exam-daily-rewards";

type Props = {
  preview: DailyRewardPreview;
};

export function ExamDailyRewardPreview({ preview }: Props) {
  const {
    completedToday,
    nextAttemptNumber,
    tierLabel,
    goodRewardsRemaining,
    xpBase,
    xpPassBonus,
    coinsPerCorrect,
    maxCoinsIfAllCorrect,
    resetsAtLabel,
    multiplier,
  } = preview;

  return (
    <Card padding="md" className="mt-6 border-amber-400/20 bg-amber-400/[0.06]">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400/15 text-amber-200">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-white">Recompensa diária de simulados</h2>
          <p className="mt-1 text-sm text-slate-300">
            Hoje você já finalizou <strong className="text-white">{completedToday}</strong>{" "}
            {completedToday === 1 ? "simulado" : "simulados"}. Este será o{" "}
            <strong className="text-white">{nextAttemptNumber}º</strong> do dia (
            <span className="text-amber-200">recompensa {tierLabel.toLowerCase()}</span>
            {multiplier < 1 ? ` — ${Math.round(multiplier * 100)}% do valor cheio` : ""}).
          </p>

          {goodRewardsRemaining > 0 ? (
            <p className="mt-2 text-sm text-emerald-200">
              Ainda restam{" "}
              <strong>
                {goodRewardsRemaining} {goodRewardsRemaining === 1 ? "simulado" : "simulados"}
              </strong>{" "}
              com recompensa acima do mínimo hoje.
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-400">
              Você já usou as recompensas cheias de hoje. Ainda pode praticar, mas ganha o valor
              mínimo fixo.
            </p>
          )}

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
              <p className="text-xs text-slate-400">XP ao finalizar</p>
              <p className="text-lg font-bold text-sky-200">+{xpBase}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
              <p className="text-xs text-slate-400">XP bônus (≥70%)</p>
              <p className="text-lg font-bold text-sky-200">+{xpPassBonus}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
              <p className="text-xs text-slate-400">Moedas por acerto</p>
              <p className="text-lg font-bold text-amber-200">+{coinsPerCorrect}</p>
              {maxCoinsIfAllCorrect > 0 && (
                <p className="text-[11px] text-slate-500">
                  até +{maxCoinsIfAllCorrect} se acertar todas as objetivas
                </p>
              )}
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            O contador zera à {resetsAtLabel}. Boosters e Premium continuam multiplicando sobre
            esses valores.
          </p>
        </div>
      </div>
    </Card>
  );
}
