import { AUTH_SESSION_COOKIE_NAMES } from "@/lib/auth-env";
import type { NextResponse } from "next/server";

const SESSION_COOKIE_PREFIXES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "authjs.callback-url",
  "__Secure-authjs.callback-url",
  "authjs.csrf-token",
  "__Secure-authjs.csrf-token",
];

function isSessionCookieName(name: string): boolean {
  return SESSION_COOKIE_PREFIXES.some((prefix) => name === prefix || name.startsWith(`${prefix}.`));
}

export function listSessionCookieNames(cookieHeader?: string | null): string[] {
  const names = new Set<string>(AUTH_SESSION_COOKIE_NAMES);

  if (!cookieHeader) return [...names];

  for (const part of cookieHeader.split(";")) {
    const name = part.trim().split("=")[0];
    if (name && isSessionCookieName(name)) names.add(name);
  }

  return [...names];
}

export function clearAllSessionCookies(
  response: NextResponse,
  cookieHeader?: string | null,
): NextResponse {
  for (const name of listSessionCookieNames(cookieHeader)) {
    response.cookies.delete(name);
  }
  return response;
}

/** Só cookies de sessão Auth.js — um JWT normal já passa de 6 KB. */
export function getSessionCookiesByteSize(cookieHeader: string | null): number {
  if (!cookieHeader) return 0;

  let size = 0;
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const name = trimmed.slice(0, eq);
    if (!isSessionCookieName(name)) continue;
    size += trimmed.length + 2;
  }
  return size;
}

export function isSessionCookieTooLarge(cookieHeader: string | null): boolean {
  return getSessionCookiesByteSize(cookieHeader) > 24_000;
}
