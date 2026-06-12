"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { toggleLikeAction } from "@/app/actions/social";
import { Avatar } from "@/components/ui/avatar";
import type { FeedActivity } from "@/lib/social";
import { formatEventText, timeAgo } from "@/lib/social";
import { cn } from "@/lib/cn";

type Props = {
  activity: FeedActivity;
  canInteract?: boolean;
};

export function ActivityCard({ activity, canInteract = false }: Props) {
  const [pending, startTransition] = useTransition();
  const [liked, setLiked] = useState(activity.likedByViewer);
  const [likes, setLikes] = useState(activity.likes);

  return (
    <article className="flex gap-3 rounded-xl border border-[#1e1e2e] bg-[#111120] p-4">
      <Link href={`/perfil/${activity.user.username}`} className="shrink-0">
        <Avatar src={activity.user.avatarUrl} alt={activity.user.username} size="sm" />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/perfil/${activity.user.username}`}
            className="font-semibold text-white transition hover:text-sky-200 hover:underline"
          >
            {activity.user.fullName}
          </Link>
          <span className="text-sm text-slate-500">@{activity.user.username}</span>
          <span className="text-sm text-slate-500">· {timeAgo(activity.createdAt)}</span>
        </div>

        <p className="mt-1 text-sm leading-6 text-slate-300">
          {formatEventText(activity.type, activity.metadata)}
        </p>

        <div className="mt-3 flex items-center gap-4 text-sm text-slate-400">
          <button
            type="button"
            disabled={!canInteract || pending}
            onClick={() => {
              if (!canInteract) return;
              startTransition(async () => {
                const result = await toggleLikeAction(activity.id);
                if (result.success && result.liked !== undefined) {
                  setLiked(result.liked);
                  setLikes((count) => count + (result.liked ? 1 : -1));
                }
              });
            }}
            className={cn(
              "inline-flex items-center gap-1.5 transition hover:text-rose-300",
              liked && "text-rose-300",
              !canInteract && "cursor-default opacity-70",
            )}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            {likes}
          </button>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" />
            {activity.comments}
          </span>
        </div>
      </div>
    </article>
  );
}
