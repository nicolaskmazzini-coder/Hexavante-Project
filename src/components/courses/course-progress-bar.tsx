type Props = {
  progress: number;
  label?: string;
};

export function CourseProgressBar({ progress, label = "Progresso do curso" }: Props) {
  const clamped = Math.min(Math.max(progress, 0), 100);

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
