"use server";

import { auth } from "@/auth";
import { isInstructor } from "@/lib/permissions";
import {
  createLiveRoomSchema,
  sendChatMessageSchema,
  updateLiveRoomSchema,
} from "@/lib/validations/live-room";
import {
  cancelLiveRoom,
  createLiveRoom,
  endLiveRoom,
  sendLiveChatMessage,
  startLiveRoom,
  updateLiveRoom,
} from "@/services/live-room.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

async function requireInstructor() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Faça login para continuar.");
  }
  if (!isInstructor(session.user.roles)) {
    throw new Error("Acesso restrito a instrutores.");
  }
  return session.user;
}

export async function createLiveRoomAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireInstructor();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sem permissão",
    };
  }

  const parsed = createLiveRoomSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    courseId: formData.get("courseId") || undefined,
    videoUrl: formData.get("videoUrl") || undefined,
    videoProvider: formData.get("videoProvider") || "youtube",
    scheduledAt: formData.get("scheduledAt"),
    maxParticipants: formData.get("maxParticipants") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const room = await createLiveRoom(user.id, parsed.data);
  revalidatePath("/live-rooms");
  revalidatePath("/instructor/live-rooms");
  redirect(`/live-rooms/${room.id}`);
}

export async function updateLiveRoomAction(
  roomId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await requireInstructor();
    const parsed = updateLiveRoomSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      courseId: formData.get("courseId") || undefined,
      videoUrl: formData.get("videoUrl") || undefined,
      videoProvider: formData.get("videoProvider") || "youtube",
      scheduledAt: formData.get("scheduledAt") || undefined,
      maxParticipants: formData.get("maxParticipants") || undefined,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    await updateLiveRoom(roomId, user.id, parsed.data);
    revalidatePath("/live-rooms");
    revalidatePath(`/live-rooms/${roomId}`);
    revalidatePath("/instructor/live-rooms");
    revalidatePath(`/instructor/live-rooms/${roomId}/edit`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar sala",
    };
  }
}

export async function cancelLiveRoomAction(roomId: string) {
  const user = await requireInstructor();
  await cancelLiveRoom(roomId, user.id);
  revalidatePath("/live-rooms");
  revalidatePath("/instructor/live-rooms");
  redirect("/instructor/live-rooms");
}

export async function startLiveRoomAction(roomId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/live-rooms/${roomId}`);
  }

  await startLiveRoom(roomId, session.user.id);
  revalidatePath(`/live-rooms/${roomId}`);
  revalidatePath("/live-rooms");
  revalidatePath("/instructor/live-rooms");
  redirect(`/live-rooms/${roomId}`);
}

export async function endLiveRoomAction(roomId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/live-rooms/${roomId}`);
  }

  await endLiveRoom(roomId, session.user.id);
  revalidatePath(`/live-rooms/${roomId}`);
  revalidatePath("/live-rooms");
  revalidatePath("/instructor/live-rooms");
  redirect(`/live-rooms/${roomId}`);
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
