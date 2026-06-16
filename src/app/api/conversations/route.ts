import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listInboxConversations, getUnreadDirectMessageCount } from "@/services/direct-message.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const [conversations, unreadCount] = await Promise.all([
    listInboxConversations(session.user.id),
    getUnreadDirectMessageCount(session.user.id),
  ]);

  return NextResponse.json({
    conversations: conversations.map((item) => ({
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
    })),
    unreadCount,
  });
}
