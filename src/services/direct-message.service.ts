import { prisma } from "@/lib/prisma";
import { assertUserCanInteract, assertUserNotBanned } from "@/lib/moderation/status";
import { isFollowing } from "@/services/follow.service";
import { createNotification } from "@/services/notification.service";

const USER_PREVIEW = {
  id: true,
  username: true,
  fullName: true,
  avatarUrl: true,
} as const;

export function normalizeParticipantPair(userIdA: string, userIdB: string) {
  return userIdA < userIdB
    ? { participantAId: userIdA, participantBId: userIdB }
    : { participantAId: userIdB, participantBId: userIdA };
}

export async function canMessageUser(
  senderId: string,
  recipientId: string,
): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  if (senderId === recipientId) {
    return { allowed: false, reason: "Você não pode enviar mensagem para si mesmo." };
  }

  try {
    await assertUserNotBanned(senderId);
    await assertUserCanInteract(senderId);
  } catch (err) {
    return {
      allowed: false,
      reason: err instanceof Error ? err.message : "Ação não permitida.",
    };
  }

  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: { id: true, profileVisibility: true },
  });
  if (!recipient) {
    return { allowed: false, reason: "Usuário não encontrado." };
  }

  if (recipient.profileVisibility === "private") {
    const [senderFollows, recipientFollows] = await Promise.all([
      isFollowing(senderId, recipientId),
      isFollowing(recipientId, senderId),
    ]);
    if (!senderFollows && !recipientFollows) {
      return {
        allowed: false,
        reason: "Este perfil é privado. Siga o usuário ou seja seguido para enviar mensagens.",
      };
    }
  }

  return { allowed: true };
}

export async function assertCanMessageUser(senderId: string, recipientId: string) {
  const check = await canMessageUser(senderId, recipientId);
  if (!check.allowed) {
    throw new Error(check.reason ?? "Não é possível enviar mensagem para este usuário.");
  }
}

export async function getConversationForUser(conversationId: string, userId: string) {
  return prisma.directConversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ participantAId: userId }, { participantBId: userId }],
    },
    include: {
      participantA: { select: USER_PREVIEW },
      participantB: { select: USER_PREVIEW },
    },
  });
}

function getOtherParticipant(
  conversation: {
    participantAId: string;
    participantBId: string;
    participantA: { id: string; username: string; fullName: string; avatarUrl: string | null };
    participantB: { id: string; username: string; fullName: string; avatarUrl: string | null };
  },
  userId: string,
) {
  return conversation.participantAId === userId
    ? conversation.participantB
    : conversation.participantA;
}

export async function getOrCreateConversation(initiatorId: string, recipientId: string) {
  await assertCanMessageUser(initiatorId, recipientId);

  const pair = normalizeParticipantPair(initiatorId, recipientId);

  const existing = await prisma.directConversation.findUnique({
    where: {
      participantAId_participantBId: {
        participantAId: pair.participantAId,
        participantBId: pair.participantBId,
      },
    },
    include: {
      participantA: { select: USER_PREVIEW },
      participantB: { select: USER_PREVIEW },
    },
  });

  if (existing) return existing;

  return prisma.directConversation.create({
    data: pair,
    include: {
      participantA: { select: USER_PREVIEW },
      participantB: { select: USER_PREVIEW },
    },
  });
}

export async function getOrCreateConversationByUsername(initiatorId: string, username: string) {
  const recipient = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (!recipient) throw new Error("Usuário não encontrado.");
  return getOrCreateConversation(initiatorId, recipient.id);
}

export async function listInboxConversations(userId: string) {
  const conversations = await prisma.directConversation.findMany({
    where: {
      OR: [{ participantAId: userId }, { participantBId: userId }],
    },
    include: {
      participantA: { select: USER_PREVIEW },
      participantB: { select: USER_PREVIEW },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          body: true,
          senderId: true,
          createdAt: true,
          readAt: true,
        },
      },
    },
    orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
  });

  const enriched = await Promise.all(
    conversations.map(async (conversation) => {
      const other = getOtherParticipant(conversation, userId);
      const lastMessage = conversation.messages[0] ?? null;
      const unreadCount = await prisma.directMessage.count({
        where: {
          conversationId: conversation.id,
          senderId: { not: userId },
          readAt: null,
        },
      });

      return {
        id: conversation.id,
        otherUser: other,
        lastMessage,
        unreadCount,
        lastMessageAt: conversation.lastMessageAt,
        createdAt: conversation.createdAt,
      };
    }),
  );

  return enriched;
}

export async function getConversationMessages(
  conversationId: string,
  userId: string,
  options?: { since?: Date; limit?: number },
) {
  const conversation = await getConversationForUser(conversationId, userId);
  if (!conversation) throw new Error("Conversa não encontrada.");

  const limit = Math.min(Math.max(options?.limit ?? 50, 1), 100);

  return prisma.directMessage.findMany({
    where: {
      conversationId,
      ...(options?.since ? { createdAt: { gt: options.since } } : {}),
    },
    orderBy: { createdAt: "asc" },
    take: limit,
    include: {
      sender: { select: USER_PREVIEW },
    },
  });
}

export async function markConversationRead(conversationId: string, userId: string) {
  const conversation = await getConversationForUser(conversationId, userId);
  if (!conversation) throw new Error("Conversa não encontrada.");

  await prisma.directMessage.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      readAt: null,
    },
    data: { readAt: new Date() },
  });
}

export async function sendDirectMessage(conversationId: string, senderId: string, body: string) {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("A mensagem não pode estar vazia.");
  if (trimmed.length > 2000) throw new Error("A mensagem pode ter no máximo 2000 caracteres.");

  const conversation = await getConversationForUser(conversationId, senderId);
  if (!conversation) throw new Error("Conversa não encontrada.");

  const recipientId =
    conversation.participantAId === senderId
      ? conversation.participantBId
      : conversation.participantAId;

  await assertCanMessageUser(senderId, recipientId);

  const [message] = await prisma.$transaction([
    prisma.directMessage.create({
      data: {
        conversationId,
        senderId,
        body: trimmed,
      },
      include: {
        sender: { select: USER_PREVIEW },
      },
    }),
    prisma.directConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  const senderName = message.sender.fullName || message.sender.username;
  await createNotification({
    userId: recipientId,
    type: "NEW_MESSAGE",
    title: "Nova mensagem",
    message: `${senderName}: ${trimmed.slice(0, 120)}${trimmed.length > 120 ? "…" : ""}`,
    link: `/mensagens/${conversationId}`,
  });

  return message;
}

export async function getUnreadDirectMessageCount(userId: string) {
  return prisma.directMessage.count({
    where: {
      readAt: null,
      senderId: { not: userId },
      conversation: {
        OR: [{ participantAId: userId }, { participantBId: userId }],
      },
    },
  });
}

export type SerializedDirectMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  sender: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
  };
};

export function serializeDirectMessage(
  message: Awaited<ReturnType<typeof getConversationMessages>>[number],
): SerializedDirectMessage {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
    readAt: message.readAt?.toISOString() ?? null,
    sender: message.sender,
  };
}
