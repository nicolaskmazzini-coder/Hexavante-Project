"use server";

import { auth } from "@/auth";
import { isInstructor } from "@/lib/permissions";
import { courseSchema, lessonSchema, materialSchema, moduleSchema } from "@/lib/validations/course";
import {
  addLesson,
  addMaterial,
  addModule,
  createCourse,
  deleteLesson,
  deleteMaterial,
  deleteModule,
  updateCourse,
  updateLesson,
  updateModule,
} from "@/services/course.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionResult = { success: boolean; error?: string };

async function requireInstructor() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Faça login para continuar.");
  }
  if (!isInstructor(session.user.roles)) {
    throw new Error("Você precisa do papel INSTRUCTOR para gerenciar cursos.");
  }
  return session.user;
}

export async function createCourseAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireInstructor();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sem permissão",
    };
  }

  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    categoryId: formData.get("categoryId"),
    shortDescription: formData.get("shortDescription") || undefined,
    description: formData.get("description") || undefined,
    thumbnailUrl: formData.get("thumbnailUrl") || undefined,
    coverImage: formData.get("coverImage") || undefined,
    removeCover: formData.get("removeCover") || "false",
    courseType: "FREE",
    level: formData.get("level") || "BEGINNER",
    estimatedHours: formData.get("estimatedHours") || undefined,
    progressionType: formData.get("progressionType") || "FREE",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const course = await createCourse(user.id, {
    ...parsed.data,
    coverImage: parsed.data.removeCover ? undefined : parsed.data.coverImage,
  });
  revalidatePath("/courses");
  revalidatePath("/instructor/courses");
  redirect(`/instructor/courses/${course.id}/edit`);
}

export async function updateCourseAction(
  courseId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await requireInstructor();
    const parsed = courseSchema.safeParse({
      title: formData.get("title"),
      categoryId: formData.get("categoryId"),
      shortDescription: formData.get("shortDescription") || undefined,
      description: formData.get("description") || undefined,
      thumbnailUrl: formData.get("thumbnailUrl") || undefined,
      coverImage: formData.get("coverImage") || undefined,
      removeCover: formData.get("removeCover") || "false",
      courseType: "FREE",
      level: formData.get("level") || "BEGINNER",
      estimatedHours: formData.get("estimatedHours") || undefined,
      progressionType: formData.get("progressionType") || "FREE",
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    await updateCourse(courseId, user.id, {
      ...parsed.data,
      coverImage: parsed.data.removeCover ? undefined : parsed.data.coverImage,
    });
    revalidatePath("/courses");
    revalidatePath("/instructor/courses");
    revalidatePath(`/instructor/courses/${courseId}/edit`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar curso",
    };
  }
}

export async function addModuleAction(
  courseId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await requireInstructor();
    const parsed = moduleSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      orderNumber: formData.get("orderNumber"),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    await addModule(courseId, user.id, parsed.data);
    revalidatePath(`/instructor/courses/${courseId}/edit`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao adicionar módulo",
    };
  }
}

export async function addLessonAction(
  courseId: string,
  moduleId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await requireInstructor();
    const parsed = lessonSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      videoUrl: formData.get("videoUrl") || undefined,
      videoProvider: formData.get("videoProvider") || "youtube",
      duration: formData.get("duration") || undefined,
      orderNumber: formData.get("orderNumber"),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    await addLesson(moduleId, user.id, parsed.data);
    revalidatePath(`/instructor/courses/${courseId}/edit`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao adicionar aula",
    };
  }
}

export async function addMaterialAction(
  courseId: string,
  moduleId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await requireInstructor();
    const parsed = materialSchema.safeParse({
      title: formData.get("title"),
      fileUrl: formData.get("fileUrl"),
      fileType: formData.get("fileType") || "pdf",
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    await addMaterial(moduleId, user.id, parsed.data);
    revalidatePath(`/instructor/courses/${courseId}/edit`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao adicionar material",
    };
  }
}

export async function updateModuleAction(
  courseId: string,
  moduleId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await requireInstructor();
    const parsed = moduleSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      orderNumber: formData.get("orderNumber"),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    await updateModule(moduleId, user.id, parsed.data);
    revalidatePath(`/instructor/courses/${courseId}/edit`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar módulo",
    };
  }
}

export async function deleteModuleAction(courseId: string, moduleId: string) {
  const user = await requireInstructor();
  await deleteModule(moduleId, user.id);
  revalidatePath(`/instructor/courses/${courseId}/edit`);
}

export async function updateLessonAction(
  courseId: string,
  lessonId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await requireInstructor();
    const parsed = lessonSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      videoUrl: formData.get("videoUrl") || undefined,
      videoProvider: formData.get("videoProvider") || "youtube",
      duration: formData.get("duration") || undefined,
      orderNumber: formData.get("orderNumber"),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    await updateLesson(lessonId, user.id, parsed.data);
    revalidatePath(`/instructor/courses/${courseId}/edit`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar aula",
    };
  }
}

export async function deleteLessonAction(courseId: string, lessonId: string) {
  const user = await requireInstructor();
  await deleteLesson(lessonId, user.id);
  revalidatePath(`/instructor/courses/${courseId}/edit`);
}

export async function deleteMaterialAction(courseId: string, materialId: string) {
  const user = await requireInstructor();
  await deleteMaterial(materialId, user.id);
  revalidatePath(`/instructor/courses/${courseId}/edit`);
}
