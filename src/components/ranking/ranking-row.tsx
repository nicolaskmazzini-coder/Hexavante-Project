"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { RankingEntry } from "@/services/xp.service";

type Props = {
  entry: RankingEntry;
  position: number;
  isCurrentUser: boolean;
  showTotalXp: boolean;
};

export function RankingRow({ entry, position, isCurrentUser, showTotalXp }: Props) {
  return (
    <li>
      <Link
        href={`/perfil/${entry.user.username}`}
        className={`flex items-center gap-4 border-b border-white/10 px-4 py-4 transition last:border-b-0 hover:bg-white/5 ${
          isCurrentUser ? "bg-sky-400/10" : ""
        }`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-sm font-bold text-slate-400">
          {position}
        </div>

        <Avatar
          src={entry.user.avatarUrl}
          alt={entry.user.username}
          size="sm"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold text-white">{entry.user.fullName}</p>
            {isCurrentUser && <Badge variant="sky">Você</Badge>}
          </div>
          <p className="truncate text-sm text-slate-400">@{entry.user.username}</p>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
            <Sparkles className="h-4 w-4 text-sky-300" />
            Nível {entry.level}
          </div>
        </div>

        <div className="text-right">
          <p className="font-semibold text-sky-200">
            {entry.periodXp.toLocaleString("pt-BR")} XP
          </p>
          {showTotalXp && (
            <p className="text-xs text-slate-500">
              Total: {entry.totalXp.toLocaleString("pt-BR")}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}
