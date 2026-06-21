"use server";

import { auth } from "@/auth";
import { requireModeratorAccount } from "@/lib/moderation/guards";
import { isInstructor } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { courseModerationSchema, instructorApplicationSchema } from "@/lib/validations/moderation";
import {
  moderateCourse,
  reviewInstructorApplication,
  setCoursePublished,
  submitCourseForReview,
  submitInstructorApplication,
} from "@/services/moderation.service";
import { setExamPublished } from "@/services/exam-admin.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionResult = { success: boolean; error?: string; message?: string };

async function requireModerator() {
  const user = await requireModeratorAccount();
  return user;
}

export async function applyInstructorAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para continuar." };
  }

  if (isInstructor(session.user.roles)) {
    return { success: false, error: "Você já é instrutor." };
  }

  const parsed = instructorApplicationSchema.safeParse({
    motivation: formData.get("motivation"),
    experience: formData.get("experience"),
    portfolioUrl: formData.get("portfolioUrl") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    await submitInstructorApplication(session.user.id, parsed.data);
    revalidatePath("/instructor/apply");
    revalidatePath("/instructor/courses");
    return { success: true, message: "Solicitação enviada! Aguarde a análise de um moderador." };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao enviar solicitação",
    };
  }
}

export async function approveInstructorAction(applicationId: string) {
  const moderator = await requireModerator();
  await reviewInstructorApplication(applicationId, moderator.id, true);
  revalidatePath("/moderacao");
  revalidatePath("/moderacao/instrutores");
}

export async function rejectInstructorAction(
  applicationId: string,
  reviewNotes: string,
): Promise<ActionResult> {
  try {
    const moderator = await requireModerator();
    if (!reviewNotes.trim() || reviewNotes.trim().length < 5) {
      return { success: false, error: "Informe o motivo da rejeição (mín. 5 caracteres)." };
    }
    await reviewInstructorApplication(applicationId, moderator.id, false, reviewNotes.trim());
    revalidatePath("/moderacao");
    revalidatePath("/moderacao/instrutores");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao rejeitar solicitação",
    };
  }
}

export async function moderateCourseAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let moderator;
  try {
    moderator = await requireModerator();
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Sem permissão" };
  }

  const parsed = courseModerationSchema.safeParse({
    courseId: formData.get("courseId"),
    status: formData.get("status"),
    reviewNotes: formData.get("reviewNotes") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    await moderateCourse(moderator.id, parsed.data);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao moderar curso",
    };
  }

  revalidatePath("/moderacao");
  revalidatePath("/moderacao/cursos");
  revalidatePath("/moderacao/conteudo");
  revalidatePath("/courses");

  const returnTo = formData.get("returnTo");
  if (typeof returnTo === "string" && returnTo.startsWith("/moderacao")) {
    redirect(returnTo);
  }

  redirect(`/moderacao/cursos/${parsed.data.courseId}`);
}

export async function toggleCoursePublishAction(courseId: string): Promise<ActionResult> {
  try {
    const moderator = await requireModerator();
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { status: true },
    });
    if (!course) return { success: false, error: "Curso não encontrado." };

    const publish = course.status !== "APPROVED";
    await setCoursePublished(courseId, moderator.id, publish);

    revalidatePath("/moderacao/conteudo");
    revalidatePath("/moderacao/cursos");
    revalidatePath("/courses");
    return { success: true, message: publish ? "Curso publicado." : "Curso despublicado." };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar curso.",
    };
  }
}

export async function toggleExamPublishAction(examId: string): Promise<ActionResult> {
  try {
    await requireModerator();
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { isPublished: true },
    });
    if (!exam) return { success: false, error: "Simulado não encontrado." };

    await setExamPublished(examId, !exam.isPublished);

    revalidatePath("/moderacao/conteudo");
    revalidatePath("/moderacao/simulados");
    revalidatePath("/simulados");
    return {
      success: true,
      message: !exam.isPublished ? "Simulado publicado." : "Simulado despublicado.",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar simulado.",
    };
  }
}

export async function resubmitCourseAction(courseId: string) {
  const session = await auth();
  if (!session?.user?.id || !isInstructor(session.user.roles)) {
    throw new Error("Sem permissão.");
  }

  await submitCourseForReview(courseId, session.user.id);
  revalidatePath(`/instructor/courses/${courseId}/edit`);
  revalidatePath("/instructor/courses");
  revalidatePath("/moderacao/cursos");
}
