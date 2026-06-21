"use client";

import { useState, useTransition } from "react";
import type { ActivityReactionType } from "@prisma/client";
import { toggleReactionAction } from "@/app/actions/community";
import { REACTION_CONFIG } from "@/lib/community";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

const REACTION_TYPES = Object.keys(REACTION_CONFIG) as ActivityReactionType[];

type Props = {
  activityId: string;
  counts: Record<ActivityReactionType, number>;
  viewerReactions: ActivityReactionType[];
  canInteract: boolean;
};

export function ActivityReactions({
  activityId,
  counts,
  viewerReactions: initialViewerReactions,
  canInteract,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [viewerReactions, setViewerReactions] = useState(initialViewerReactions);
  const [reactionCounts, setReactionCounts] = useState(counts);
  const { toast } = useToast();

  function toggle(type: ActivityReactionType) {
    if (!canInteract || pending) return;

    startTransition(async () => {
      const result = await toggleReactionAction(activityId, type);
      if (!result.success) {
        toast(result.error ?? "Erro ao reagir.", "error");
        return;
      }

      const active = result.active ?? false;
      setViewerReactions((current) =>
        active ? [...current, type] : current.filter((value) => value !== type),
      );
      setReactionCounts((current) => ({
        ...current,
        [type]: Math.max(0, current[type] + (active ? 1 : -1)),
      }));
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {REACTION_TYPES.map((type) => {
        const config = REACTION_CONFIG[type];
        const active = viewerReactions.includes(type);
        const count = reactionCounts[type];

        return (
          <button
            key={type}
            type="button"
            disabled={!canInteract || pending}
            onClick={() => toggle(type)}
            title={config.label}
            className={cn(
              "inline-flex min-h-9 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition",
              active
                ? "bg-amber-400/15 text-amber-100 ring-1 ring-amber-400/30"
                : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200",
              !canInteract && "cursor-default opacity-70",
            )}
            aria-label={`${config.label}${count > 0 ? `, ${count}` : ""}`}
          >
            <span aria-hidden>{config.emoji}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
