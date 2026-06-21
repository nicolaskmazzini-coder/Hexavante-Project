import Link from "next/link";
import type { RankingPeriod } from "@/services/xp.service";
import { cn } from "@/lib/cn";

const PERIODS: { value: RankingPeriod; label: string }[] = [
  { value: "month", label: "Temporada" },
  { value: "week", label: "Semanal" },
  { value: "all", label: "Total" },
];

type Props = {
  current: RankingPeriod;
};

export function RankingFilters({ current }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {PERIODS.map((period) => (
        <Link
          key={period.value}
          href={`/ranking?period=${period.value}`}
          className={cn(
            "rounded-lg border px-4 py-2 text-sm font-semibold transition",
            current === period.value
              ? "border-sky-400/40 bg-sky-400/15 text-sky-100"
              : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-sky-400/25 hover:text-white",
          )}
        >
          {period.label}
        </Link>
      ))}
    </div>
  );
}
