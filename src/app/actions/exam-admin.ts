"use server";

import { auth } from "@/auth";
import { canModerate } from "@/lib/permissions";
import { examAdminSchema, examQuestionSchema } from "@/lib/validations/exam";
import {
  addExamQuestion,
  createExam,
  deleteExam,
  deleteExamQuestion,
  updateExam,
} from "@/services/exam-admin.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionResult = { success: boolean; error?: string };

async function requireModerator() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Faça login para continuar.");
  }
  if (!canModerate(session.user.roles)) {
    throw new Error("Acesso restrito a moderadores.");
  }
  return session.user;
}

export async function createExamAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireModerator();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sem permissão",
    };
  }

  const parsed = examAdminSchema.safeParse({
    title: formData.get("title"),
    examType: formData.get("examType"),
    description: formData.get("description") || undefined,
    timeLimit: formData.get("timeLimit") || undefined,
    isPublished: formData.get("isPublished") || "false",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const exam = await createExam(parsed.data);
  revalidatePath("/moderacao/simulados");
  revalidatePath("/simulados");
  redirect(`/moderacao/simulados/${exam.id}/edit`);
}

export async function updateExamAction(
  examId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireModerator();
    const parsed = examAdminSchema.safeParse({
      title: formData.get("title"),
      examType: formData.get("examType"),
      description: formData.get("description") || undefined,
      timeLimit: formData.get("timeLimit") || undefined,
      isPublished: formData.get("isPublished") || "false",
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    await updateExam(examId, parsed.data);
    revalidatePath("/moderacao/simulados");
    revalidatePath(`/moderacao/simulados/${examId}/edit`);
    revalidatePath("/simulados");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar simulado",
    };
  }
}

export async function addExamQuestionAction(
  examId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireModerator();
    const parsed = examQuestionSchema.safeParse({
      statement: formData.get("statement"),
      orderNumber: formData.get("orderNumber"),
      altA: formData.get("altA"),
      altB: formData.get("altB"),
      altC: formData.get("altC"),
      altD: formData.get("altD"),
      correctAlternative: formData.get("correctAlternative"),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    await addExamQuestion(examId, parsed.data);
    revalidatePath(`/moderacao/simulados/${examId}/edit`);
    revalidatePath("/simulados");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao adicionar questão",
    };
  }
}

export async function deleteExamQuestionAction(examId: string, questionId: string) {
  await requireModerator();
  await deleteExamQuestion(questionId);
  revalidatePath(`/moderacao/simulados/${examId}/edit`);
  revalidatePath("/simulados");
}

export async function deleteExamAction(examId: string) {
  await requireModerator();
  await deleteExam(examId);
  revalidatePath("/moderacao/simulados");
  revalidatePath("/simulados");
  redirect("/moderacao/simulados");
}
