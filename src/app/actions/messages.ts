"use server";

import { auth } from "@/auth";
import {
  getOrCreateConversation,
  getOrCreateConversationByUsername,
  sendDirectMessage,
  serializeDirectMessage,
} from "@/services/direct-message.service";
import { revalidatePath } from "next/cache";

export type MessageActionResult = {
  success: boolean;
  error?: string;
  conversationId?: string;
  message?: ReturnType<typeof serializeDirectMessage>;
};

export async function startConversationAction(
  recipientUserId: string,
): Promise<MessageActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para enviar mensagens." };
  }

  try {
    const conversation = await getOrCreateConversation(session.user.id, recipientUserId);
    revalidatePath("/mensagens");
    return { success: true, conversationId: conversation.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao iniciar conversa.",
    };
  }
}

export async function startConversationByUsernameAction(
  username: string,
): Promise<MessageActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para enviar mensagens." };
  }

  try {
    const conversation = await getOrCreateConversationByUsername(session.user.id, username);
    revalidatePath("/mensagens");
    return { success: true, conversationId: conversation.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao iniciar conversa.",
    };
  }
}

export async function sendDirectMessageAction(
  conversationId: string,
  body: string,
): Promise<MessageActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para enviar mensagens." };
  }

  try {
    const message = await sendDirectMessage(conversationId, session.user.id, body);
    revalidatePath("/mensagens");
    revalidatePath(`/mensagens/${conversationId}`);
    return { success: true, message: serializeDirectMessage(message) };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao enviar mensagem.",
    };
  }
}
