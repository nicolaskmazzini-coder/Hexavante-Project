"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validations/profile";
import type { ZodError } from "zod";

export type ProfileActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  avatarUrl?: string;
};

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

function mapZodErrors(error: ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function updateProfileAction(
  _prev: ProfileActionResult,
  formData: FormData,
): Promise<ProfileActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para continuar." };
  }

  const raw = {
    fullName: formData.get("fullName"),
    bio: formData.get("bio") ?? "",
    phone: formData.get("phone") ?? "",
    city: formData.get("city") ?? "",
    state: formData.get("state") ?? "",
    profileVisibility: formData.get("profileVisibility"),
  };

  const parsed = updateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Corrija os campos destacados.",
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      fullName: parsed.data.fullName,
      bio: parsed.data.bio || null,
      phone: parsed.data.phone || null,
      city: parsed.data.city || null,
      state: parsed.data.state?.toUpperCase() || null,
      profileVisibility: parsed.data.profileVisibility,
    },
  });

  revalidatePath("/perfil");
  revalidatePath("/");

  return { success: true };
}

export async function updateProfilePhotoAction(file: File): Promise<ProfileActionResult> {
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

    revalidatePath("/perfil");
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
        ? "O banco ainda precisa ser atualizado para aceitar fotos. Rode npm run db:sync ou npx prisma db push."
        : "Erro ao atualizar foto de perfil.",
    };
  }
}
