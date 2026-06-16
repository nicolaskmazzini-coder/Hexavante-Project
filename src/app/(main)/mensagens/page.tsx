import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { auth } from "@/auth";
import { MessagesShell } from "@/components/messages/messages-shell";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { listInboxConversations } from "@/services/direct-message.service";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/mensagens");

  const conversations = await listInboxConversations(session.user.id);

  const serialized = conversations.map((item) => ({
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

  return (
    <PageShell>
      <PageHeader
        badge="Social"
        icon={MessageCircle}
        title="Mensagens"
        description="Converse em privado com outros estudantes — como no Instagram ou Twitter."
      />

      <MessagesShell conversations={serialized} currentUserId={session.user.id} />
    </PageShell>
  );
}
