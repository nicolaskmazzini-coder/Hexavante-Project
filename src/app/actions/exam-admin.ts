"use server";

import { auth } from "@/auth";
import { canModerate } from "@/lib/permissions";
import { parseAlternativesFromFormData } from "@/lib/exam-alternatives";
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
    coverImage: formData.get("coverImage") || undefined,
    removeCover: formData.get("removeCover") || "false",
    timeLimit: formData.get("timeLimit") || undefined,
    isPublished: formData.get("isPublished") || "false",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const exam = await createExam({
    ...parsed.data,
    coverImage: parsed.data.removeCover ? undefined : parsed.data.coverImage,
  });
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
      coverImage: formData.get("coverImage") || undefined,
      removeCover: formData.get("removeCover") || "false",
      timeLimit: formData.get("timeLimit") || undefined,
      isPublished: formData.get("isPublished") || "false",
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    await updateExam(examId, {
      ...parsed.data,
      coverImage: parsed.data.removeCover ? undefined : parsed.data.coverImage,
    });
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
    const type = formData.get("type") === "ESSAY" ? "ESSAY" : "MULTIPLE_CHOICE";

    const parsed = examQuestionSchema.safeParse(
      type === "ESSAY"
        ? {
            type: "ESSAY",
            statement: formData.get("statement"),
            imageUrl: formData.get("imageUrl") || undefined,
            imageWidth: formData.get("imageWidth") || undefined,
            imageHeight: formData.get("imageHeight") || undefined,
            imageDisplaySize: formData.get("imageDisplaySize") || "MEDIUM",
            orderNumber: formData.get("orderNumber"),
            expectedAnswer: formData.get("expectedAnswer"),
          }
        : {
            type: "MULTIPLE_CHOICE",
            statement: formData.get("statement"),
            imageUrl: formData.get("imageUrl") || undefined,
            imageWidth: formData.get("imageWidth") || undefined,
            imageHeight: formData.get("imageHeight") || undefined,
            imageDisplaySize: formData.get("imageDisplaySize") || "MEDIUM",
            orderNumber: formData.get("orderNumber"),
            alternatives: parseAlternativesFromFormData(formData),
            correctAlternative: formData.get("correctAlternative"),
          },
    );

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
