"use client";

import Link from "next/link";
import type { NotificationType } from "@prisma/client";
import { cn } from "@/lib/cn";
import {
  NOTIFICATION_TYPE_META,
  formatNotificationRelativeTime,
  isRankingSeasonNotification,
} from "@/lib/notifications";

export type NotificationView = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

type Props = {
  notification: NotificationView;
  compact?: boolean;
  onRead?: (id: string) => void;
  onNavigate?: () => void;
};

export function NotificationItem({ notification, compact = false, onRead, onNavigate }: Props) {
  const meta = NOTIFICATION_TYPE_META[notification.type];
  const Icon = meta.icon;
  const isUnread = !notification.readAt;
  const createdAt = new Date(notification.createdAt);

  const content = (
    <div
      className={cn(
        "flex gap-3 transition",
        compact ? "px-4 py-3 hover:bg-white/[0.04]" : "rounded-xl border border-[#1e1e2e] bg-[#111120] p-4 hover:border-sky-400/25",
        isUnread && (compact ? "bg-sky-400/5" : "border-sky-400/20 bg-sky-400/5"),
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04]",
          meta.accent,
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-white">{notification.title}</p>
          <span className="shrink-0 text-[11px] text-slate-500">
            {formatNotificationRelativeTime(createdAt)}
          </span>
        </div>
        <p className={cn("mt-1 text-slate-400", compact ? "line-clamp-2 text-xs" : "text-sm")}>
          {notification.message}
        </p>
        {!compact && isRankingSeasonNotification(notification.type, notification.link) && (
          <p className="mt-2 text-xs text-sky-300/80">Temporada de ranking</p>
        )}
      </div>
      {isUnread && (
        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sky-400" aria-hidden />
      )}
    </div>
  );

  const handleActivate = () => {
    if (isUnread) onRead?.(notification.id);
    onNavigate?.();
  };

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={handleActivate} className="block">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className="block w-full text-left" onClick={handleActivate}>
      {content}
    </button>
  );
}
