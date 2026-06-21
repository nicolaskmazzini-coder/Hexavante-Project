import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { auth } from "@/auth";
import { ConversationHeader } from "@/components/messages/conversation-header";
import { MessageThreadWrapper } from "@/components/messages/message-thread-wrapper";
import { MessagesShell } from "@/components/messages/messages-shell";
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
  const displayName = otherUser.fullName ?? otherUser.username ?? "Usuário";

  return (
    // Reduced padding so the shell height calculation is accurate
    <PageShell className="py-4 sm:py-6 md:py-8">
      <PageHeader
        badge="Social"
        icon={MessageCircle}
        title="Mensagens"
        description="Converse em privado com outros estudantes."
        className="mb-5"
      />

      <MessagesShell
        conversations={serializedInbox}
        currentUserId={session.user.id}
        activeConversationId={conversationId}
      >
        <div className="flex h-full min-h-0 flex-col">
          <ConversationHeader
            fullName={displayName}
            username={otherUser.username}
            avatarUrl={otherUser.avatarUrl}
          />
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
