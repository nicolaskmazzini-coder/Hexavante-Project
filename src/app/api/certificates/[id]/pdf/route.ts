import { auth } from "@/auth";
import { buildCertificatePdf } from "@/lib/certificate-pdf";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: {
      user: { select: { fullName: true } },
      course: {
        select: {
          title: true,
          category: { select: { name: true } },
        },
      },
    },
  });

  if (!certificate || certificate.userId !== session.user.id) {
    return NextResponse.json({ error: "Certificado não encontrado" }, { status: 404 });
  }

  const pdfBytes = await buildCertificatePdf({
    studentName: certificate.user.fullName,
    courseTitle: certificate.course.title,
    categoryName: certificate.course.category.name,
    code: certificate.code,
    issuedAt: certificate.issuedAt,
  });

  const filename = `certificado-${certificate.code}.pdf`;

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
