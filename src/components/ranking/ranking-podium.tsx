import { Crown, Medal, Sparkles } from "lucide-react";
import type { RankingEntry } from "@/services/xp.service";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

type Props = {
  entries: RankingEntry[];
  currentUserId?: string;
  periodLabel: string;
};

const podiumStyles = [
  {
    order: "order-2 md:order-1",
    height: "h-28",
    medal: "bg-slate-300/20 text-slate-100 border-slate-300/30",
    icon: Medal,
    label: "2º",
  },
  {
    order: "order-1 md:order-2",
    height: "h-36",
    medal: "bg-amber-400/20 text-amber-100 border-amber-400/40",
    icon: Crown,
    label: "1º",
  },
  {
    order: "order-3",
    height: "h-24",
    medal: "bg-orange-400/20 text-orange-100 border-orange-400/30",
    icon: Medal,
    label: "3º",
  },
];

export function RankingPodium({ entries, currentUserId, periodLabel }: Props) {
  const topThree = [entries[1], entries[0], entries[2]].filter(Boolean);

  if (topThree.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-gradient-to-b from-sky-500/10 to-transparent p-6">
      <p className="mb-6 text-center text-sm font-semibold uppercase tracking-wide text-sky-200">
        Pódio {periodLabel}
      </p>

      <div className="flex items-end justify-center gap-3 md:gap-6">
        {topThree.map((entry, index) => {
          if (!entry) return <div key={index} className="w-28" />;
          const style = podiumStyles[index];
          const Icon = style.icon;
          const isCurrentUser = currentUserId === entry.userId;

          return (
            <div
              key={entry.id}
              className={cn("flex w-28 flex-col items-center md:w-32", style.order)}
            >
              <div
                className={cn(
                  "mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2",
                  style.medal,
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <p className="truncate text-center text-sm font-bold text-white">
                @{entry.user.username}
              </p>
              {isCurrentUser && (
                <Badge variant="sky" className="mt-1">
                  Você
                </Badge>
              )}
              <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-sky-300" />
                Nv. {entry.level}
              </div>
              <p className="mt-1 text-sm font-semibold text-sky-200">
                {entry.periodXp.toLocaleString("pt-BR")} XP
              </p>
              <div
                className={cn(
                  "mt-3 flex w-full items-end justify-center rounded-t-xl border border-white/10 bg-white/[0.06]",
                  style.height,
                )}
              >
                <span className="pb-2 text-lg font-black text-white">{style.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
