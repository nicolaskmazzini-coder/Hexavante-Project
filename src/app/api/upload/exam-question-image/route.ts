import { auth } from "@/auth";

import { canModerate } from "@/lib/permissions";

import {
  buildExamQuestionImageFilename,
  COURSE_COVER_MAX_BYTES,
  COURSE_COVER_MIME_TYPES,
} from "@/lib/upload";

import { mkdir, writeFile } from "fs/promises";

import path from "path";

import sharp from "sharp";

export const runtime = "nodejs";

const MAX_DIMENSION = 1920;

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || !canModerate(session.user.roles)) {
    return Response.json({ error: "Não autorizado." }, { status: 403 });
  }

  const formData = await request.formData();

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "Arquivo não enviado." }, { status: 400 });
  }

  if (!COURSE_COVER_MIME_TYPES.has(file.type)) {
    return Response.json(
      { error: "Formato inválido. Use JPEG, PNG ou WebP." },

      { status: 400 },
    );
  }

  if (file.size > COURSE_COVER_MAX_BYTES) {
    return Response.json({ error: "Arquivo muito grande. Máximo 5 MB." }, { status: 400 });
  }

  const filename = buildExamQuestionImageFilename(file.type);

  if (!filename) {
    return Response.json({ error: "Formato de imagem não suportado." }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "exam-questions");

  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());

  const output = await sharp(buffer)
    .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })

    .webp({ quality: 85 })

    .toBuffer();

  const metadata = await sharp(output).metadata();

  const outputName = filename.replace(/\.[^.]+$/, ".webp");

  await writeFile(path.join(uploadDir, outputName), output);

  return Response.json({
    url: `/uploads/exam-questions/${outputName}`,

    width: metadata.width ?? 1,

    height: metadata.height ?? 1,
  });
}
