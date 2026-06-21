import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import {
  DASHBOARD_QUICK_ACTIONS,
  type DashboardPendingItem,
} from "@/services/dashboard-pending.service";

type Props = {
  pendingItems: DashboardPendingItem[];
};

const toneStyles: Record<DashboardPendingItem["tone"], string> = {
  sky: "border-sky-400/25 bg-sky-400/10 text-sky-200 hover:border-sky-400/40",
  violet: "border-violet-400/25 bg-violet-400/10 text-violet-200 hover:border-violet-400/40",
  amber: "border-amber-400/25 bg-amber-400/10 text-amber-200 hover:border-amber-400/40",
  orange: "border-orange-400/25 bg-orange-400/10 text-orange-200 hover:border-orange-400/40",
  emerald: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200 hover:border-emerald-400/40",
};

export function DashboardCommandCenter({ pendingItems }: Props) {
  return (
    <section className="mt-8" data-tour="dashboard-command">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sky-300">
            <Zap className="h-4 w-4" />
            <p className="text-xs font-bold uppercase tracking-wide">Central de estudos</p>
          </div>
          <h2 className="mt-1 text-lg font-bold text-white">Sua rotina de hoje</h2>
          <p className="mt-1 text-sm text-slate-400">Um clique para a próxima ação importante.</p>
        </div>
      </div>

      {pendingItems.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {pendingItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "group flex flex-col rounded-xl border p-4 transition",
                toneStyles[item.tone],
              )}
            >
              <p className="text-sm font-bold">{item.label}</p>
              <p className="mt-1 line-clamp-2 text-xs opacity-90">{item.description}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold">
                Abrir
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      )}

      <Card padding="md" className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Atalhos</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DASHBOARD_QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-sky-400/30 hover:bg-sky-400/10 hover:text-white"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </Card>
    </section>
  );
}
