"use server";

import { auth } from "@/auth";
import {
  addMemberSchema,
  assignTeacherSchema,
  createSchoolClassSchema,
  createSchoolCourseSchema,
  createSchoolSchema,
  enrollStudentSchema,
} from "@/lib/validations/school";
import {
  addSchoolMember,
  assignTeacherToClass,
  createSchool,
  createSchoolClass,
  createSchoolCourse,
  enrollStudentInClass,
  removeSchoolMember,
  requireMembership,
} from "@/services/school.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionResult = { success: boolean; error?: string };

export async function createSchoolAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para continuar." };
  }

  const parsed = createSchoolSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    const school = await createSchool(session.user.id, parsed.data);
    revalidatePath("/schools");
    redirect(`/schools/${school.id}`);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar instituição",
    };
  }
}

export async function addMemberAction(
  schoolId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para continuar." };
  }

  const parsed = addMemberSchema.safeParse({
    email: formData.get("email"),
    institutionRole: formData.get("institutionRole"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    const membership = await requireMembership(session.user.id, schoolId);
    await addSchoolMember(membership.institutionRole, schoolId, parsed.data);
    revalidatePath(`/schools/${schoolId}/members`);
    revalidatePath(`/schools/${schoolId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao adicionar membro",
    };
  }
}

export async function removeMemberAction(schoolId: string, memberId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Faça login para continuar.");
  }

  const membership = await requireMembership(session.user.id, schoolId);
  await removeSchoolMember(
    membership.institutionRole,
    session.user.id,
    schoolId,
    memberId,
  );
  revalidatePath(`/schools/${schoolId}/members`);
  revalidatePath(`/schools/${schoolId}`);
}

export async function createSchoolCourseAction(
  schoolId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para continuar." };
  }

  const courseId = formData.get("courseId") as string;

  const parsed = createSchoolCourseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    courseId: courseId && courseId !== "" ? courseId : undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    const membership = await requireMembership(session.user.id, schoolId);
    const course = await createSchoolCourse(
      membership.institutionRole,
      schoolId,
      parsed.data,
    );
    revalidatePath(`/schools/${schoolId}/courses`);
    revalidatePath(`/schools/${schoolId}`);
    redirect(`/schools/${schoolId}/courses/${course.id}`);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar curso",
    };
  }
}

export async function createSchoolClassAction(
  schoolId: string,
  schoolCourseId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para continuar." };
  }

  const parsed = createSchoolClassSchema.safeParse({
    name: formData.get("name"),
    semester: formData.get("semester") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    const membership = await requireMembership(session.user.id, schoolId);
    const schoolClass = await createSchoolClass(
      membership.institutionRole,
      schoolId,
      schoolCourseId,
      parsed.data,
    );
    revalidatePath(`/schools/${schoolId}/courses/${schoolCourseId}`);
    redirect(`/schools/${schoolId}/classes/${schoolClass.id}`);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar turma",
    };
  }
}

export async function enrollStudentAction(
  schoolId: string,
  classId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para continuar." };
  }

  const parsed = enrollStudentSchema.safeParse({
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    const membership = await requireMembership(session.user.id, schoolId);
    await enrollStudentInClass(
      membership.institutionRole,
      schoolId,
      classId,
      parsed.data.userId,
    );
    revalidatePath(`/schools/${schoolId}/classes/${classId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao matricular aluno",
    };
  }
}

export async function assignTeacherAction(
  schoolId: string,
  classId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para continuar." };
  }

  const parsed = assignTeacherSchema.safeParse({
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    const membership = await requireMembership(session.user.id, schoolId);
    await assignTeacherToClass(
      membership.institutionRole,
      schoolId,
      classId,
      parsed.data.userId,
    );
    revalidatePath(`/schools/${schoolId}/classes/${classId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atribuir professor",
    };
  }
}
