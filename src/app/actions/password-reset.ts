"use server";

import { headers } from "next/headers";
import { extractClientIp, rateLimitAuthAction } from "@/lib/rate-limit";
import {
  createPasswordResetToken,
  resetPasswordWithToken,
} from "@/services/password-reset.service";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations/profile";
import type { ZodError } from "zod";

export type PasswordResetResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  /** Apenas em desenvolvimento quando e-mail não é enviado */
  devResetUrl?: string;
  message?: string;
};

function mapZodErrors(error: ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function requestPasswordResetAction(
  _prev: PasswordResetResult,
  formData: FormData,
): Promise<PasswordResetResult> {
  const headersList = await headers();
  const ip = extractClientIp(headersList.get("x-forwarded-for"), headersList.get("x-real-ip"));
  if (!rateLimitAuthAction(ip)) {
    return { success: false, error: "Muitas tentativas. Tente novamente em alguns minutos." };
  }

  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: mapZodErrors(parsed.error),
      error: parsed.error.issues[0]?.message ?? "E-mail inválido",
    };
  }

  const token = await createPasswordResetToken(parsed.data.email);
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

  // Sempre retorna sucesso genérico por segurança; em dev mostra link se token criado
  if (token && process.env.NODE_ENV === "development") {
    return {
      success: true,
      message:
        "Se o e-mail estiver cadastrado, você receberá instruções. Em desenvolvimento, use o link abaixo:",
      devResetUrl: `${baseUrl}/redefinir-senha?token=${token}`,
    };
  }

  return {
    success: true,
    message: "Se o e-mail estiver cadastrado com senha, enviaremos instruções para redefinição.",
  };
}

export async function resetPasswordAction(
  _prev: PasswordResetResult,
  formData: FormData,
): Promise<PasswordResetResult> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: mapZodErrors(parsed.error),
      error: "Corrija os campos destacados.",
    };
  }

  try {
    await resetPasswordWithToken(parsed.data.token, parsed.data.password);
    return {
      success: true,
      message: "Senha redefinida com sucesso! Você já pode entrar.",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Não foi possível redefinir a senha.",
    };
  }
}
