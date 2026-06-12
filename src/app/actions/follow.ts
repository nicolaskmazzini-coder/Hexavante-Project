"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { assertUserCanInteract } from "@/lib/moderation/status";
import { followUser, unfollowUser } from "@/services/follow.service";

export type FollowActionResult = {
  success: boolean;
  following?: boolean;
  error?: string;
};

export async function toggleFollowAction(userId: string): Promise<FollowActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para seguir usuários." };
  }

  try {
    await assertUserCanInteract(session.user.id);
    const { isFollowing } = await import("@/services/follow.service");
    const alreadyFollowing = await isFollowing(session.user.id, userId);

    if (alreadyFollowing) {
      await unfollowUser(session.user.id, userId);
      revalidatePath("/social");
      revalidatePath("/perfil", "layout");
      return { success: true, following: false };
    }

    await followUser(session.user.id, userId);
    revalidatePath("/social");
    revalidatePath("/perfil", "layout");
    return { success: true, following: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao seguir usuário.",
    };
  }
}
