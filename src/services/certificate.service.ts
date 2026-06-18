// Importações necessárias para o serviço de certificados
import { prisma } from "@/lib/prisma"; // Cliente Prisma para banco de dados
import { generateCertificateCode } from "@/lib/certificate"; // Função para gerar código de certificado
import { logger } from "@/lib/logger"; // Sistema de logging
import { createNotification } from "@/services/notification.service";

// Função para emitir certificado
// Verifica se o usuário concluiu o curso e emite um certificado se ainda não existir
export async function issueCertificate(userId: string, courseId: string) {
  // Busca matrícula do usuário no curso com progresso >= 100%
  const enrollment = await prisma.courseEnrollment.findFirst({
    where: {
      userId,
      courseId,
      progress: { gte: 100 },
    },
  });

  // Verifica se o usuário concluiu o curso
  if (!enrollment) {
    throw new Error("Você precisa concluir o curso para emitir o certificado.");
  }

  const certificate = await prisma.$transaction(async (tx) => {
    const existing = await tx.certificate.findFirst({
      where: { userId, courseId },
      include: {
        user: { select: { fullName: true, username: true } },
        course: { select: { title: true } },
      },
    });

    if (existing) return existing;

    return tx.certificate.create({
      data: {
        userId,
        courseId,
        code: generateCertificateCode(),
      },
      include: {
        user: { select: { fullName: true, username: true } },
        course: { select: { title: true } },
      },
    });
  });

  logger.info("Certificado emitido", { certificateId: certificate.id, userId, courseId });

  await createNotification({
    userId,
    type: "CERTIFICATE_ISSUED",
    title: "Certificado emitido",
    message: `Seu certificado do curso "${certificate.course.title}" está disponível.`,
    link: "/certificados",
  });

  return certificate;
}

// Função para verificar certificado
// Busca certificado pelo código e atualiza data de verificação
export async function verifyCertificate(code: string) {
  // Busca certificado pelo código com dados do usuário e curso
  const certificate = await prisma.certificate.findUnique({
    where: { code },
    include: {
      user: {
        select: {
          fullName: true,
          username: true,
        },
      },
      course: {
        select: {
          title: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  // Retorna null se não encontrar certificado
  if (!certificate) {
    return null;
  }

  // Atualiza data de verificação do certificado
  await prisma.certificate.update({
    where: { id: certificate.id },
    data: { verifiedAt: new Date() },
  });

  logger.info("Certificado verificado", { certificateId: certificate.id, code });
  return certificate;
}

// Função para obter certificados do usuário
// Retorna todos os certificados do usuário ordenados por data de emissão
export async function getUserCertificates(userId: string) {
  return prisma.certificate.findMany({
    where: { userId },
    include: {
      user: {
        select: {
          fullName: true,
          username: true,
        },
      },
      course: {
        select: {
          title: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { issuedAt: "desc" },
  });
}
