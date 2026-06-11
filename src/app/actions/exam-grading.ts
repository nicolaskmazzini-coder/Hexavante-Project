"use server";

import { auth } from "@/auth";
import { canModerate } from "@/lib/permissions";
import { essayGradeSchema } from "@/lib/validations/exam";
import { gradeEssayAnswer } from "@/services/exam-grading.service";
import { revalidatePath } from "next/cache";

export type ActionResult = { success: boolean; error?: string };

async function requireModerator() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Faça login para continuar.");
  }
  if (!canModerate(session.user.roles)) {
    throw new Error("Acesso restrito a moderadores e administradores.");
  }
  return session.user;
}

export async function gradeEssayAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireModerator();
    const parsed = essayGradeSchema.safeParse({
      answerId: formData.get("answerId"),
      status: formData.get("status"),
      comment: formData.get("comment") || undefined,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    await gradeEssayAnswer(parsed.data);
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
