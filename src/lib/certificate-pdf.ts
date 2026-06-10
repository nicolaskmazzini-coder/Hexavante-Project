import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type CertificatePdfData = {
  studentName: string;
  courseTitle: string;
  categoryName: string;
  code: string;
  issuedAt: Date;
};

export async function buildCertificatePdf(data: CertificatePdfData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const { width, height } = page.getSize();

  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: rgb(0.2, 0.55, 0.95),
    borderWidth: 3,
  });

  page.drawText("HEXAVANTE", {
    x: 48,
    y: height - 72,
    size: 28,
    font: bold,
    color: rgb(0.15, 0.45, 0.85),
  });

  page.drawText("Certificado de conclusão", {
    x: 48,
    y: height - 110,
    size: 18,
    font: regular,
    color: rgb(0.25, 0.25, 0.3),
  });

  page.drawText("Certificamos que", {
    x: 48,
    y: height - 170,
    size: 14,
    font: regular,
    color: rgb(0.35, 0.35, 0.4),
  });

  page.drawText(data.studentName, {
    x: 48,
    y: height - 205,
    size: 30,
    font: bold,
    color: rgb(0.1, 0.1, 0.15),
  });

  page.drawText("concluiu com sucesso o curso", {
    x: 48,
    y: height - 245,
    size: 14,
    font: regular,
    color: rgb(0.35, 0.35, 0.4),
  });

  page.drawText(data.courseTitle, {
    x: 48,
    y: height - 280,
    size: 22,
    font: bold,
    color: rgb(0.1, 0.1, 0.15),
  });

  page.drawText(`Categoria: ${data.categoryName}`, {
    x: 48,
    y: height - 315,
    size: 12,
    font: regular,
    color: rgb(0.4, 0.4, 0.45),
  });

  page.drawText(`Emitido em: ${data.issuedAt.toLocaleDateString("pt-BR")}`, {
    x: 48,
    y: 72,
    size: 11,
    font: regular,
    color: rgb(0.4, 0.4, 0.45),
  });

  page.drawText(`Código de verificação: ${data.code}`, {
    x: 48,
    y: 52,
    size: 11,
    font: bold,
    color: rgb(0.15, 0.45, 0.85),
  });

  return pdf.save();
}
