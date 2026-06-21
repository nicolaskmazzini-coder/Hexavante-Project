"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { ContentPolicyError } from "@/lib/profanity-filter";
import { assertUserCanInteract } from "@/lib/moderation/status";
import {
  acceptCommentSchema,
  addCommentSchema,
  createDiscussionSchema,
  reactionSchema,
} from "@/lib/validations/community";
import {
  acceptActivityComment,
  addActivityComment,
  createDiscussionPost,
  getActivityComments,
  toggleActivityReaction,
  toggleCommentLike,
} from "@/services/community.service";

export type CommunityActionResult = {
  success: boolean;
  error?: string;
};

export async function createDiscussionAction(
  _prev: CommunityActionResult,
  formData: FormData,
): Promise<CommunityActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para publicar." };
  }

  const tags = formData.getAll("tags").map(String);
  const parsed = createDiscussionSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    tags,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await assertUserCanInteract(session.user.id);
    await createDiscussionPost(session.user.id, parsed.data);
    revalidatePath("/social");
    return { success: true };
  } catch (error) {
    if (error instanceof ContentPolicyError) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Não foi possível publicar.",
    };
  }
}

export async function addCommentAction(
  _prev: CommunityActionResult,
  formData: FormData,
): Promise<CommunityActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para comentar." };
  }

  const parsed = addCommentSchema.safeParse({
    activityId: formData.get("activityId"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Comentário inválido." };
  }

  try {
    await assertUserCanInteract(session.user.id);
    await addActivityComment(parsed.data.activityId, session.user.id, parsed.data.content);
    revalidatePath("/social");
    return { success: true };
  } catch (error) {
    if (error instanceof ContentPolicyError) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Não foi possível comentar.",
    };
  }
}

export async function acceptCommentAction(
  activityId: string,
  commentId: string,
): Promise<CommunityActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para continuar." };
  }

  const parsed = acceptCommentSchema.safeParse({ activityId, commentId });
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos." };
  }

  try {
    await acceptActivityComment(parsed.data.activityId, parsed.data.commentId, session.user.id);
    revalidatePath("/social");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Não foi possível aceitar a resposta.",
    };
  }
}

export async function toggleCommentLikeAction(commentId: string): Promise<CommunityActionResult & { liked?: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para curtir." };
  }

  try {
    await assertUserCanInteract(session.user.id);
    const result = await toggleCommentLike(commentId, session.user.id);
    revalidatePath("/social");
    return { success: true, liked: result.liked };
  } catch {
    return { success: false, error: "Erro ao curtir comentário." };
  }
}

export async function toggleReactionAction(
  activityId: string,
  type: string,
): Promise<CommunityActionResult & { active?: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para reagir." };
  }

  const parsed = reactionSchema.safeParse({ activityId, type });
  if (!parsed.success) {
    return { success: false, error: "Reação inválida." };
  }

  try {
    await assertUserCanInteract(session.user.id);
    const result = await toggleActivityReaction(
      parsed.data.activityId,
      session.user.id,
      parsed.data.type,
    );
    revalidatePath("/social");
    return { success: true, active: result.active };
  } catch {
    return { success: false, error: "Erro ao reagir." };
  }
}

export async function loadCommentsAction(activityId: string) {
  const session = await auth();
  return getActivityComments(activityId, session?.user?.id);
}
