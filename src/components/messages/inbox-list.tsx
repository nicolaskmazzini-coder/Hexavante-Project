"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";

export type InboxConversation = {
  id: string;
  otherUser: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
  };
  lastMessage: {
    id: string;
    body: string;
    senderId: string;
    createdAt: string;
    readAt: string | null;
  } | null;
  unreadCount: number;
  lastMessageAt: string | null;
  createdAt: string;
};

type Props = {
  initialConversations: InboxConversation[];
  activeConversationId?: string;
  currentUserId: string;
};

const POLL_INTERVAL_MS = 5000;

function formatPreviewTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();
  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (sameDay) {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function InboxList({ initialConversations, activeConversationId, currentUserId }: Props) {
  const [conversations, setConversations] = useState(initialConversations);
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/conversations");
      if (!response.ok) return;
      const data = (await response.json()) as { conversations: InboxConversation[] };
      setConversations(data.conversations);
    } catch {
      // Ignora falhas temporárias
    }
  }, []);

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  useEffect(() => {
    const interval = setInterval(() => void refresh(), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
        <MessageCircle className="h-10 w-10 text-slate-500" />
        <p className="mt-4 text-sm font-semibold text-slate-300">Nenhuma conversa ainda</p>
        <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
          Visite um perfil e toque em Mensagem para iniciar um chat privado.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/10">
      {conversations.map((conversation) => {
        const isActive =
          activeConversationId === conversation.id || pathname === `/mensagens/${conversation.id}`;
        const preview = conversation.lastMessage?.body ?? "Inicie a conversa";
        const previewTime = formatPreviewTime(
          conversation.lastMessageAt ?? conversation.createdAt,
        );
        const youSentLast = conversation.lastMessage?.senderId === currentUserId;

        return (
          <Link
            key={conversation.id}
            href={`/mensagens/${conversation.id}`}
            className={cn(
              "flex items-center gap-3 px-4 py-3 transition hover:bg-white/[0.04]",
              isActive && "bg-sky-400/10",
            )}
          >
            <Avatar
              src={conversation.otherUser.avatarUrl}
              alt={conversation.otherUser.username}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-white">
                  {conversation.otherUser.fullName}
                </p>
                <span className="shrink-0 text-[11px] text-slate-500">{previewTime}</span>
              </div>
              <p className="truncate text-xs text-slate-400">
                {youSentLast ? `Você: ${preview}` : preview}
              </p>
            </div>
            {conversation.unreadCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-500 px-1.5 text-[10px] font-bold text-white">
                {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
