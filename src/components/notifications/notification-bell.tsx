"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/cn";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) {
        if (response.status === 401) {
          setNotifications([]);
          setUnreadCount(0);
        }
        return;
      }
      const data = (await response.json()) as {
        notifications: NotificationItem[];
        unreadCount: number;
      };
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // Ignora falhas temporárias
    }
  }, []);

  useEffect(() => {
    const run = () => {
      void loadNotifications();
    };

    const timer = window.setTimeout(run, 0);
    const interval = window.setInterval(() => {
      if (!document.hidden) run();
    }, 30000);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [loadNotifications]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const markAllRead = async () => {
    const response = await fetch("/api/notifications", { method: "PATCH" });
    if (!response.ok) return;
    setUnreadCount(0);
    setNotifications((current) =>
      current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })),
    );
  };

  const markOneRead = async (id: string) => {
    const response = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    if (!response.ok) return;
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, readAt: item.readAt ?? new Date().toISOString() } : item,
      ),
    );
    setUnreadCount((count) => Math.max(count - 1, 0));
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          if (!open) void loadNotifications();
        }}
        className="relative rounded-lg border border-white/10 bg-white/[0.04] p-2 text-slate-200 transition hover:border-sky-400/30 hover:bg-sky-400/10"
        aria-label="Notificações"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-white/10 bg-[#0b0f18] shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold text-white">Notificações</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-xs text-sky-300 hover:underline"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">Nenhuma notificação.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {notifications.map((item) => {
                const content = (
                  <div
                    className={cn(
                      "px-4 py-3 transition hover:bg-white/[0.04]",
                      !item.readAt && "bg-sky-400/5",
                    )}
                  >
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">{item.message}</p>
                    <p className="mt-2 text-[10px] text-slate-500">
                      {new Date(item.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                );

                return (
                  <li key={item.id} className="border-b border-white/5 last:border-b-0">
                    {item.link ? (
                      <Link
                        href={item.link}
                        onClick={() => {
                          if (!item.readAt) void markOneRead(item.id);
                          setOpen(false);
                        }}
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() => {
                          if (!item.readAt) void markOneRead(item.id);
                        }}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
