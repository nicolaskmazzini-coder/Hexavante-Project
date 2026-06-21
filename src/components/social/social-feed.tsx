"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { FeedActivity } from "@/lib/social";
import { ActivityCard } from "./activity-card";
import { CommunitySidebar } from "./community-sidebar";
import { DiscussionForm } from "./discussion-form";
import { cn } from "@/lib/cn";

type TrendingTag = { tag: string; count: number };

type SuggestedUser = {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  _count: { followers: number; socialActivities: number };
};

type Props = {
  exploreActivities: FeedActivity[];
  followingActivities: FeedActivity[];
  questionsActivities: FeedActivity[];
  trendingTags: TrendingTag[];
  suggestedUsers: SuggestedUser[];
  canInteract: boolean;
  viewerId?: string;
  initialTag?: string;
  highlightPostId?: string;
};

type Tab = "explore" | "following" | "questions";

export function SocialFeed({
  exploreActivities,
  followingActivities,
  questionsActivities,
  trendingTags,
  suggestedUsers,
  canInteract,
  viewerId,
  initialTag,
  highlightPostId,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(highlightPostId ? "questions" : "explore");
  const [activeTag, setActiveTag] = useState<string | undefined>(initialTag);

  useEffect(() => {
    if (!highlightPostId) return;
    const element = document.getElementById(`post-${highlightPostId}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightPostId]);

  const activities = useMemo(() => {
    const source =
      tab === "following"
        ? followingActivities
        : tab === "questions"
          ? questionsActivities
          : exploreActivities;

    if (!activeTag) return source;
    return source.filter((activity) => activity.tags.includes(activeTag));
  }, [activeTag, exploreActivities, followingActivities, questionsActivities, tab]);

  function handleTagSelect(tag: string | undefined) {
    setActiveTag(tag);
    const params = new URLSearchParams(searchParams.toString());
    if (tag) {
      params.set("tag", tag);
    } else {
      params.delete("tag");
    }
    const query = params.toString();
    router.replace(query ? `/social?${query}` : "/social", { scroll: false });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <DiscussionForm canPost={canInteract} />

        <div className="mt-4 flex flex-wrap gap-2 border-b border-[#1e1e2e] pb-3">
          {(
            [
              { value: "explore", label: "Explorar" },
              { value: "following", label: "Seguindo" },
              { value: "questions", label: "Perguntas" },
            ] as const
          ).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                "rounded-full px-4 py-2.5 text-sm font-semibold transition min-h-11",
                tab === value
                  ? "bg-sky-400/15 text-sky-100"
                  : "text-slate-400 hover:bg-white/[0.05] hover:text-white",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTag && (
          <p className="mt-3 text-sm text-slate-400">
            Filtrando por <span className="font-semibold text-sky-200">{activeTag}</span>
          </p>
        )}

        {!canInteract && (
          <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
            <Link
              href="/login?callbackUrl=/social"
              className="font-semibold text-sky-300 hover:underline"
            >
              Entre na sua conta
            </Link>{" "}
            para publicar, curtir, reagir e ver o feed de quem você segue.
          </p>
        )}

        <div className="mt-4 space-y-4">
          {activities.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-[#111120] p-6 text-center sm:p-10">
              <p className="font-semibold text-slate-200">
                {tab === "following"
                  ? "Nenhuma atividade de quem você segue."
                  : tab === "questions"
                    ? "Nenhuma pergunta ainda."
                    : "Nenhuma atividade ainda."}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {tab === "following"
                  ? "Siga outros estudantes no ranking ou nos perfis."
                  : tab === "questions"
                    ? "Seja o primeiro a publicar uma dúvida ou dica."
                    : "Conclua cursos e simulados para aparecer aqui."}
              </p>
            </div>
          ) : (
            activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                canInteract={canInteract}
                viewerId={viewerId}
                highlight={highlightPostId === activity.id}
              />
            ))
          )}
        </div>
      </div>

      <CommunitySidebar
        trendingTags={trendingTags}
        suggestedUsers={suggestedUsers}
        activeTag={activeTag}
        onTagSelect={handleTagSelect}
        canFollow={canInteract}
      />
    </div>
  );
}
