"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { assertUserCanInteract } from "@/lib/moderation/status";
import { toggleActivityLike } from "@/services/social.service";

export type SocialActionResult = {
  success: boolean;
  liked?: boolean;
  error?: string;
};

export async function toggleLikeAction(activityId: string): Promise<SocialActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para curtir." };
  }

  try {
    await assertUserCanInteract(session.user.id);
    const result = await toggleActivityLike(activityId, session.user.id);
    revalidatePath("/social");
    return { success: true, liked: result.liked };
  } catch {
    return { success: false, error: "Erro ao curtir atividade." };
  }
}
