import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { auth } from "@/auth";
import { MessageThreadWrapper } from "@/components/messages/message-thread-wrapper";
import { MessagesShell } from "@/components/messages/messages-shell";
import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import {
  getConversationForUser,
  getConversationMessages,
  listInboxConversations,
  markConversationRead,
  serializeDirectMessage,
} from "@/services/direct-message.service";

type Props = {
  params: Promise<{ conversationId: string }>;
};

export default async function ConversationPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/mensagens");

  const { conversationId } = await params;

  const [conversation, conversations] = await Promise.all([
    getConversationForUser(conversationId, session.user.id),
    listInboxConversations(session.user.id),
  ]);

  if (!conversation) redirect("/mensagens");

  const otherUser =
    conversation.participantAId === session.user.id
      ? conversation.participantB
      : conversation.participantA;

  await markConversationRead(conversationId, session.user.id);
  const messages = await getConversationMessages(conversationId, session.user.id, { limit: 100 });

  const serializedInbox = conversations.map((item) => ({
    id: item.id,
    otherUser: item.otherUser,
    lastMessage: item.lastMessage
      ? {
          ...item.lastMessage,
          createdAt: item.lastMessage.createdAt.toISOString(),
          readAt: item.lastMessage.readAt?.toISOString() ?? null,
        }
      : null,
    unreadCount: item.unreadCount,
    lastMessageAt: item.lastMessageAt?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString(),
  }));

  const serializedMessages = messages.map(serializeDirectMessage);

  return (
    <PageShell>
      <PageHeader
        badge="Social"
        icon={MessageCircle}
        title="Mensagens"
        description="Converse em privado com outros estudantes."
      />

      <MessagesShell
        conversations={serializedInbox}
        currentUserId={session.user.id}
        activeConversationId={conversationId}
      >
        <div className="flex h-full min-h-[50vh] flex-col">
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <Link
              href="/mensagens"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition hover:text-white lg:hidden"
              aria-label="Voltar para mensagens"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Avatar src={otherUser.avatarUrl} alt={otherUser.username} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{otherUser.fullName}</p>
              <Link
                href={`/perfil/${otherUser.username}`}
                className="text-xs text-slate-400 transition hover:text-sky-300"
              >
                @{otherUser.username}
              </Link>
            </div>
          </div>

          <div className="min-h-0 flex-1">
            <MessageThreadWrapper
              conversationId={conversationId}
              currentUserId={session.user.id}
              initialMessages={serializedMessages}
            />
          </div>
        </div>
      </MessagesShell>
    </PageShell>
  );
}
