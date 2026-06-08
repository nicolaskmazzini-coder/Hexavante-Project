"use server";

import { auth } from "@/auth";
import { endLiveRoom, sendLiveChatMessage, startLiveRoom } from "@/services/live-room.service";
import { sendChatMessageSchema } from "@/lib/validations/live-room";

export type ActionResult = { success: boolean; error?: string };

export type ChatMessageResult = ActionResult & {
  message?: {
    id: string;
    userId: string;
    username: string;
    fullName: string;
    message: string;
    createdAt: Date;
  };
};

export async function startLiveRoomAction(roomId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para continuar." };
  }

  try {
    await startLiveRoom(roomId, session.user.id);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao iniciar transmissão",
    };
  }
}

export async function endLiveRoomAction(roomId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para continuar." };
  }

  try {
    await endLiveRoom(roomId, session.user.id);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao encerrar transmissão",
    };
  }
}

export async function sendChatMessageAction(
  roomId: string,
  message: string,
): Promise<ChatMessageResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para continuar." };
  }

  try {
    const parsed = sendChatMessageSchema.safeParse({ message });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Mensagem inválida",
      };
    }

    const created = await sendLiveChatMessage(roomId, session.user.id, parsed.data.message);
    return {
      success: true,
      message: {
        id: created.id,
        userId: created.userId,
        username: created.user.username,
        fullName: created.user.fullName,
        message: created.message,
        createdAt: created.createdAt,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao enviar mensagem",
    };
  }
}
