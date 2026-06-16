"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export function MessagesNavBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/messages/unread-count");
      if (!response.ok) {
        if (response.status === 401) setUnreadCount(0);
        return;
      }
      const data = (await response.json()) as { unreadCount: number };
      setUnreadCount(data.unreadCount);
    } catch {
      // Ignora falhas temporárias
    }
  }, []);

  useEffect(() => {
    const run = () => void load();
    const timer = window.setTimeout(run, 0);
    const interval = window.setInterval(() => {
      if (!document.hidden) run();
    }, 15000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [load]);

  return (
    <Link
      href="/mensagens"
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-sky-400/30 hover:text-sky-200",
      )}
      aria-label={unreadCount > 0 ? `Mensagens (${unreadCount} não lidas)` : "Mensagens"}
    >
      <MessageCircle className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500 px-1 text-[10px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
