import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { InboxList } from "@/components/messages/inbox-list";
import type { InboxConversation } from "@/components/messages/inbox-list";
import { cn } from "@/lib/cn";

type Props = {
  conversations: InboxConversation[];
  currentUserId: string;
  activeConversationId?: string;
  children?: React.ReactNode;
};

export function MessagesShell({ conversations, currentUserId, activeConversationId, children }: Props) {
  const inChat = Boolean(activeConversationId);

  return (
    <div
      className={cn(
        "hx-card flex overflow-hidden",
        inChat
          // Conversation view: fixed height that won't overflow the page
          ? "h-[min(700px,calc(100svh-var(--hx-header-height)-6rem))] flex-col lg:grid lg:grid-cols-[300px_minmax(0,1fr)]"
          // Inbox view: natural min-height, grows with content
          : "min-h-[560px] lg:grid lg:grid-cols-[300px_minmax(0,1fr)]",
      )}
    >
      {/* Sidebar: always visible on desktop, hidden on mobile when in chat */}
      <aside
        className={cn(
          "flex min-h-0 flex-col border-white/10 lg:border-r",
          inChat ? "hidden lg:flex" : "flex flex-1 lg:flex-none",
        )}
      >
        <div className="shrink-0 border-b border-white/10 px-4 py-3.5">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-sky-300" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-300">Conversas</h2>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <InboxList
            initialConversations={conversations}
            activeConversationId={activeConversationId}
            currentUserId={currentUserId}
          />
        </div>
      </aside>

      {/* Main content: chat or empty state */}
      <section
        className={cn(
          "flex min-h-0 min-w-0 flex-col",
          inChat ? "flex-1" : "hidden lg:flex",
        )}
      >
        {children ?? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
            <MessageCircle className="h-11 w-11 text-slate-600" />
            <p className="mt-4 text-base font-semibold text-slate-300">Suas mensagens</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
              Selecione uma conversa ou visite um perfil e toque em{" "}
              <strong className="font-medium text-slate-300">Mensagem</strong>.
            </p>
            <Link
              href="/social"
              className="mt-5 text-sm font-semibold text-sky-300 transition hover:text-sky-200"
            >
              Explorar comunidade →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
