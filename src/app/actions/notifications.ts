"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { markAllNotificationsRead } from "@/services/notification.service";

export type ActionResult = { success: boolean; error?: string };

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para continuar." };
  }

  await markAllNotificationsRead(session.user.id);
  revalidatePath("/notificacoes");
  return { success: true };
}
