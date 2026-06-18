export const AUTH_PUBLIC_EXACT = new Set([
  "/",
  "/login",
  "/register",
  "/recuperar-senha",
  "/redefinir-senha",
  "/manutencao",
  "/suspenso",
  "/privacidade",
]);

export const AUTH_PUBLIC_PREFIXES = [
  "/api/auth",
  "/api/platform/status",
  "/certificados/verificar",
];

export function isPublicAuthRoute(pathname: string): boolean {
  if (AUTH_PUBLIC_EXACT.has(pathname)) return true;
  return AUTH_PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function getSafeCallbackUrl(value: string | null | undefined, fallback = "/"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
