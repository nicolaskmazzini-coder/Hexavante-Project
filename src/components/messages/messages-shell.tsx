import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { InboxList } from "@/components/messages/inbox-list";
import type { InboxConversation } from "@/components/messages/inbox-list";

type Props = {
  conversations: InboxConversation[];
  currentUserId: string;
  activeConversationId?: string;
  children?: React.ReactNode;
};

export function MessagesShell({
  conversations,
  currentUserId,
  activeConversationId,
  children,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111120] shadow-2xl shadow-black/20">
      <div className="grid min-h-[70vh] lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside
          className={`border-b border-white/10 lg:border-b-0 lg:border-r ${
            activeConversationId ? "hidden lg:block" : "block"
          }`}
        >
          <div className="border-b border-white/10 px-4 py-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-sky-300" />
              <h2 className="text-lg font-bold text-white">Mensagens</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">Conversas privadas com outros estudantes</p>
          </div>
          <div className="max-h-[calc(70vh-80px)] overflow-y-auto lg:max-h-[calc(70vh-80px)]">
            <InboxList
              initialConversations={conversations}
              activeConversationId={activeConversationId}
              currentUserId={currentUserId}
            />
          </div>
        </aside>

        <section
          className={`min-h-[50vh] ${
            activeConversationId ? "flex flex-col" : "hidden lg:flex lg:flex-col"
          }`}
        >
          {children ?? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <MessageCircle className="h-12 w-12 text-slate-600" />
              <p className="mt-4 text-lg font-semibold text-slate-300">Suas mensagens</p>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Selecione uma conversa ao lado ou visite um perfil e toque em{" "}
                <strong className="text-slate-300">Mensagem</strong> para começar.
              </p>
              <Link
                href="/social"
                className="mt-5 text-sm font-semibold text-sky-300 hover:text-sky-200"
              >
                Explorar comunidade
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
