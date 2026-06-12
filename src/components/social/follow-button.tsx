"use client";

import { useState, useTransition } from "react";
import { toggleFollowAction } from "@/app/actions/follow";
import { cn } from "@/lib/cn";

type Props = {
  userId: string;
  initialFollowing: boolean;
  className?: string;
};

export function FollowButton({ userId, initialFollowing, className }: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await toggleFollowAction(userId);
          if (result.success && result.following !== undefined) {
            setFollowing(result.following);
          }
        });
      }}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-semibold transition disabled:opacity-50",
        following
          ? "border border-white/20 text-slate-300 hover:border-white/35 hover:text-white"
          : "bg-blue-600 text-white hover:bg-blue-700",
        className,
      )}
    >
      {pending ? "..." : following ? "Seguindo" : "Seguir"}
    </button>
  );
}
