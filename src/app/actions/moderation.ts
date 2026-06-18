"use server";

import { auth } from "@/auth";
import { canModerate, isInstructor } from "@/lib/permissions";
import { courseModerationSchema, instructorApplicationSchema } from "@/lib/validations/moderation";
import {
  moderateCourse,
  reviewInstructorApplication,
  submitCourseForReview,
  submitInstructorApplication,
} from "@/services/moderation.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionResult = { success: boolean; error?: string; message?: string };

async function requireModerator() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Faça login para continuar.");
  if (!canModerate(session.user.roles)) {
    throw new Error("Acesso restrito a moderadores.");
  }
  return session.user;
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
  revalidatePath("/courses");
  redirect("/moderacao/cursos");
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
