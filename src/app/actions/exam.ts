"use server";

import { auth } from "@/auth";
import { submitExamSchema } from "@/lib/validations/exam";
import {
  getActiveAttempt,
  startAttempt,
  submitAttempt,
} from "@/services/exam.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionResult = { success: boolean; error?: string };

export async function startExamAction(examId: string, slug: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/simulados/${slug}`);
  }

  const active = await getActiveAttempt(session.user.id, examId);
  if (active) {
    redirect(`/simulados/${slug}/fazer?attempt=${active.id}`);
  }

  const attempt = await startAttempt(session.user.id, examId);
  redirect(`/simulados/${slug}/fazer?attempt=${attempt.id}`);
}

export async function submitExamAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para continuar." };
  }

  const attemptId = formData.get("attemptId") as string;
  const slug = formData.get("slug") as string;

  const answers: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("q_")) {
      answers[key.replace("q_", "")] = value as string;
    }
  }

  const parsed = submitExamSchema.safeParse({ attemptId, answers });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    await submitAttempt(
      session.user.id,
      parsed.data.attemptId,
      parsed.data.answers,
    );
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao enviar simulado",
    };
  }

  revalidatePath("/simulados");
  revalidatePath("/simulados/historico");
  revalidatePath("/perfil");
  revalidatePath("/ranking");
  redirect(`/simulados/${slug}/resultado/${parsed.data.attemptId}`);
}
