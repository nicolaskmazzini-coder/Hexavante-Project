import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { generateCertificateQrPng } from "@/lib/certificate-qr";
import { getCertificatePublicUrl } from "@/lib/certificate-share";

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

  const qrPng = await generateCertificateQrPng(getCertificatePublicUrl(data.code), 140);
  const qrImage = await pdf.embedPng(qrPng);
  page.drawImage(qrImage, {
    x: width - 180,
    y: 40,
    width: 120,
    height: 120,
  });

  page.drawText("Verificar online", {
    x: width - 178,
    y: 28,
    size: 9,
    font: regular,
    color: rgb(0.4, 0.4, 0.45),
  });

  return pdf.save();
}
