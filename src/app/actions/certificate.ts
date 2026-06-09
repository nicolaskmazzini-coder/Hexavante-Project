"use server";

import { auth } from "@/auth";
import { verifyCertificateSchema } from "@/lib/validations/certificate";
import {
  getUserCertificates,
  issueCertificate,
  verifyCertificate,
} from "@/services/certificate.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function issueCertificateAction(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/courses`);
  }

  try {
    await issueCertificate(session.user.id, courseId);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Erro ao emitir certificado",
    );
  }

  revalidatePath("/certificados");
  redirect("/certificados");
}

export async function verifyCertificateByCode(code: string) {
  const parsed = verifyCertificateSchema.safeParse({ code });
  if (!parsed.success) return null;
  return verifyCertificate(parsed.data.code);
}

export async function getUserCertificatesAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  return getUserCertificates(session.user.id);
}
