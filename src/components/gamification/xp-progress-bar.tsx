type Props = {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  progressPercent: number;
  compact?: boolean;
};

export function XpProgressBar({
  level,
  currentXp,
  xpToNextLevel,
  progressPercent,
  compact = false,
}: Props) {
  if (compact) {
    return (
      <div className="flex min-w-[140px] flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-sky-200">Nível {level}</span>
          <span className="text-slate-300">
            {currentXp}/{xpToNextLevel} XP
          </span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full border border-white/10 bg-slate-950/70"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progresso de XP: ${progressPercent}%`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-teal-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-lg font-bold text-sky-200">Nível {level}</span>
        <span className="text-slate-300">
          {currentXp} / {xpToNextLevel} XP
        </span>
      </div>
      <div
        className="h-4 overflow-hidden rounded-full border border-white/10 bg-slate-950/70"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progresso de XP: ${progressPercent}%`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-teal-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-medium text-slate-400">
        {progressPercent}% para o próximo nível
      </p>
    </div>
  );
}
