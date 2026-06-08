"use server";

// Importações necessárias para autenticação
import { headers } from "next/headers"; // Para obter IP do usuário
import { registerSchema } from "@/lib/validations/auth"; // Schema de validação
import { registerUser } from "@/services/auth.service"; // Serviço de registro
import { signIn } from "@/auth"; // Função de login do NextAuth
import { AuthError } from "next-auth"; // Tipo de erro do NextAuth
import { rateLimitAuthAction } from "@/lib/rate-limit"; // Rate limiting

// Tipo para resultado de ações (sucesso ou erro)
export type ActionResult = {
  success: boolean;
  error?: string;
};

function getSafeCallbackUrl(value: FormDataEntryValue | null): string {
  const url = typeof value === "string" ? value : "/";
  if (!url.startsWith("/") || url.startsWith("//")) return "/";
  return url;
}

// Action de registro de novo usuário
// Valida dados, aplica rate limiting, registra usuário e faz login automático
export async function registerAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  // Obtém IP do usuário para rate limiting
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
  
  // Verifica rate limiting (5 tentativas por minuto)
  if (!rateLimitAuthAction(ip)) {
    return { success: false, error: "Muitas tentativas. Tente novamente em alguns minutos." };
  }

  // Extrai dados do formulário
  const raw = {
    username: formData.get("username"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    birthDate: formData.get("birthDate"),
  };

  // Valida dados com Zod
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  // Tenta registrar usuário
  try {
    await registerUser(parsed.data);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao cadastrar",
    };
  }

  // Faz login automático após registro
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: getSafeCallbackUrl(formData.get("callbackUrl")),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Cadastro ok, mas falha ao entrar. Tente o login." };
    }
    throw error;
  }

  return { success: true };
}

// Action de login de usuário
// Valida credenciais, aplica rate limiting e faz login
export async function loginAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  // Obtém IP do usuário para rate limiting
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
  
  // Verifica rate limiting (5 tentativas por minuto)
  if (!rateLimitAuthAction(ip)) {
    return { success: false, error: "Muitas tentativas. Tente novamente em alguns minutos." };
  }

  // Tenta fazer login
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: getSafeCallbackUrl(formData.get("callbackUrl")),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "E-mail ou senha incorretos." };
    }
    throw error;
  }

  return { success: true };
}
