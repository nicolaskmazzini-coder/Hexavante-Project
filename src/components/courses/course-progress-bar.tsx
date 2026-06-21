type Props = {
  progress: number;
  label?: string;
  prominent?: boolean;
  subtitle?: string;
};

export function CourseProgressBar({
  progress,
  label = "Progresso do curso",
  prominent = false,
  subtitle,
}: Props) {
  const clamped = Math.min(Math.max(progress, 0), 100);

  if (prominent) {
    return (
      <div className="rounded-xl border border-sky-400/25 bg-gradient-to-r from-sky-500/10 to-teal-500/5 p-4">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-sky-300">{label}</p>
            {subtitle && <p className="mt-1 text-sm text-slate-300">{subtitle}</p>}
          </div>
          <p className="text-3xl font-black text-white">{Math.round(clamped)}%</p>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-800/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 via-sky-300 to-teal-400 transition-all duration-500"
            style={{ width: `${clamped}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold text-white">{Math.round(clamped)}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-teal-400 transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
