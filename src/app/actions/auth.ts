"use server";

// Importações necessárias para autenticação
import { cookies, headers } from "next/headers";
import { registerSchema, loginSchema } from "@/lib/validations/auth"; // Schema de validação
import type { ZodError } from "zod";
import { registerUser } from "@/services/auth.service"; // Serviço de registro
import { signIn } from "@/auth"; // Função de login do NextAuth
import { AuthError } from "next-auth"; // Tipo de erro do NextAuth
import { AUTH_SESSION_COOKIE_NAMES, isSignInFailureResult } from "@/lib/auth-env";
import { rateLimitAuthAction } from "@/lib/rate-limit"; // Rate limiting
import { Prisma } from "@prisma/client";

// Tipo para resultado de ações (sucesso ou erro)
export type ActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  redirectTo?: string;
};

function mapZodErrors(error: ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

function getSafeCallbackUrl(value: FormDataEntryValue | null): string {
  const url = typeof value === "string" ? value : "/";
  if (!url.startsWith("/") || url.startsWith("//")) return "/";
  return url;
}

async function clearStaleSessionCookies() {
  const cookieStore = await cookies();
  for (const name of AUTH_SESSION_COOKIE_NAMES) {
    cookieStore.delete(name);
  }
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
    return {
      success: false,
      error: "Corrija os campos destacados.",
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  // Tenta registrar usuário
  try {
    await registerUser(parsed.data);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, error: "E-mail ou nome de usuário já está em uso." };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao cadastrar",
    };
  }

  const callbackUrl = getSafeCallbackUrl(formData.get("callbackUrl"));

  await clearStaleSessionCookies();

  let signInResult: unknown;
  try {
    signInResult = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Cadastro ok, mas falha ao entrar. Tente o login." };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao entrar após cadastro.",
    };
  }

  if (isSignInFailureResult(signInResult)) {
    return { success: false, error: "Cadastro ok, mas falha ao entrar. Tente o login." };
  }

  return { success: true, redirectTo: callbackUrl };
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
  const email = formData.get("email");
  const password = formData.get("password");

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return {
      success: false,
      error: "Corrija os campos destacados.",
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const callbackUrl = getSafeCallbackUrl(formData.get("callbackUrl"));

  await clearStaleSessionCookies();

  let signInResult: unknown;
  try {
    signInResult = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "E-mail ou senha incorretos." };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao entrar. Tente novamente.",
    };
  }

  if (isSignInFailureResult(signInResult)) {
    return { success: false, error: "E-mail ou senha incorretos." };
  }

  return { success: true, redirectTo: callbackUrl };
}
