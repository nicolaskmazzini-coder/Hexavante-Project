"use server";

import { requireModeratorAccount } from "@/lib/moderation/guards";
import { essayGradeSchema } from "@/lib/validations/exam";
import { gradeEssayAnswer } from "@/services/exam-grading.service";
import { revalidatePath } from "next/cache";

export type ActionResult = { success: boolean; error?: string };

export async function gradeEssayAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const moderator = await requireModeratorAccount();
    const parsed = essayGradeSchema.safeParse({
      answerId: formData.get("answerId"),
      status: formData.get("status"),
      comment: formData.get("comment") || undefined,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    await gradeEssayAnswer(parsed.data, moderator.id);
    revalidatePath("/moderacao/simulados/correcoes");
    revalidatePath("/simulados");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao corrigir resposta",
    };
  }
}
