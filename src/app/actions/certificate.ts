"use server";

import { auth } from "@/auth";
import { issueCertificate, verifyCertificate, getUserCertificates } from "@/services/certificate.service";

export type ActionResult = { success: boolean; error?: string };

export async function issueCertificateAction(courseId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para continuar." };
  }

  try {
    await issueCertificate(session.user.id, courseId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao emitir certificado",
    };
  }
}

export async function verifyCertificateAction(code: string) {
  try {
    const certificate = await verifyCertificate(code);
    return certificate;
  } catch (error) {
    return null;
  }
}

export async function getUserCertificatesAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  return getUserCertificates(session.user.id);
}
