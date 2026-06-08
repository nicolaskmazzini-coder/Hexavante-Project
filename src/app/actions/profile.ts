"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ActionResult = { success: boolean; error?: string; avatarUrl?: string };

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

export async function updateProfilePhotoAction(file: File): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para continuar." };
  }

  if (!file || file.size === 0) {
    return { success: false, error: "Selecione uma imagem válida." };
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { success: false, error: "Use uma imagem PNG, JPG, GIF ou WebP." };
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return { success: false, error: "A imagem deve ter no máximo 5MB." };
  }

  try {
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const avatarUrl = `data:${file.type};base64,${base64}`;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl },
    });

    return { success: true, avatarUrl };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const isColumnTooSmall =
      message.includes("Data too long") ||
      message.includes("value too long") ||
      message.includes("1406");

    return {
      success: false,
      error: isColumnTooSmall
        ? "O banco ainda precisa ser atualizado para aceitar fotos. Rode npx prisma db push e tente novamente."
        : "Erro ao atualizar foto de perfil.",
    };
  }
}
