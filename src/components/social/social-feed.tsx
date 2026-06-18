"use client";

import Link from "next/link";
import { useState } from "react";
import type { FeedActivity } from "@/lib/social";
import { ActivityCard } from "./activity-card";
import { cn } from "@/lib/cn";

type Props = {
  exploreActivities: FeedActivity[];
  followingActivities: FeedActivity[];
  canInteract: boolean;
};

export function SocialFeed({ exploreActivities, followingActivities, canInteract }: Props) {
  const [tab, setTab] = useState<"explore" | "following">("explore");
  const activities = tab === "following" ? followingActivities : exploreActivities;

  return (
    <div>
      <div className="flex gap-2 border-b border-[#1e1e2e] pb-3">
        {(["explore", "following"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              tab === value
                ? "bg-sky-400/15 text-sky-100"
                : "text-slate-400 hover:bg-white/[0.05] hover:text-white",
            )}
          >
            {value === "explore" ? "Explorar" : "Seguindo"}
          </button>
        ))}
      </div>

      {!canInteract && (
        <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
          <Link
            href="/login?callbackUrl=/social"
            className="font-semibold text-sky-300 hover:underline"
          >
            Entre na sua conta
          </Link>{" "}
          para curtir atividades e ver o feed de quem você segue.
        </p>
      )}

      <div className="mt-4 space-y-4">
        {activities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 bg-[#111120] p-10 text-center">
            <p className="font-semibold text-slate-200">
              {tab === "following"
                ? "Nenhuma atividade de quem você segue."
                : "Nenhuma atividade ainda."}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {tab === "following"
                ? "Siga outros estudantes no ranking ou nos perfis."
                : "Conclua cursos e simulados para aparecer aqui."}
            </p>
          </div>
        ) : (
          activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} canInteract={canInteract} />
          ))
        )}
      </div>
    </div>
  );
}
