import { auth } from "@/auth";
import { clearAllSessionCookies, hasActiveSessionCookie, isSessionCookieTooLarge } from "@/lib/auth-cookies";
import { canModerate, isAdmin } from "@/lib/permissions";
import { NextResponse } from "next/server";

const MODERATOR_REQUIRED = /^\/moderacao(\/|$)/;

const MAINTENANCE_EXEMPT =
  /^\/(manutencao|suspenso|login|register|recuperar-senha|redefinir-senha)(\/|$)/;

const MAINTENANCE_CACHE_TTL_MS = 30_000;
const MAINTENANCE_FETCH_TIMEOUT_MS = 2_000;
let maintenanceCache: { enabled: boolean; at: number } | null = null;

function getInternalOrigin(publicOrigin: string): string {
  const configured = process.env.INTERNAL_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  // Evita round-trip pelo Cloudflare Tunnel em cada request do middleware.
  if (publicOrigin.includes("localhost") || publicOrigin.includes("127.0.0.1")) {
    return publicOrigin.replace(/\/$/, "");
  }

  return "http://127.0.0.1:3000";
}

function clearSessionCookies(response: NextResponse, cookieHeader?: string | null) {
  return clearAllSessionCookies(response, cookieHeader);
}

function applyStaleSessionCleanup(
  response: NextResponse,
  cookieHeader: string | null,
  isAuthenticated: boolean,
) {
  if (!isAuthenticated && hasActiveSessionCookie(cookieHeader)) {
    return clearSessionCookies(response, cookieHeader);
  }
  return response;
}

function cacheMaintenance(enabled: boolean) {
  maintenanceCache = { enabled, at: Date.now() };
  return enabled;
}

async function isMaintenanceEnabled(publicOrigin: string): Promise<boolean> {
  if (maintenanceCache && Date.now() - maintenanceCache.at < MAINTENANCE_CACHE_TTL_MS) {
    return maintenanceCache.enabled;
  }

  const origin = getInternalOrigin(publicOrigin);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), MAINTENANCE_FETCH_TIMEOUT_MS);
    const res = await fetch(`${origin}/api/platform/status`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return cacheMaintenance(false);

    const data = (await res.json()) as { maintenance?: { enabled?: boolean } };
    return cacheMaintenance(Boolean(data.maintenance?.enabled));
  } catch {
    return cacheMaintenance(false);
  }
}

export default auth(async (req) => {
  const cookieHeader = req.headers.get("cookie");
  const isAuthenticated = Boolean(req.auth?.user?.id);

  if (isSessionCookieTooLarge(cookieHeader)) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("error", "cookies_cleared");
    return clearSessionCookies(NextResponse.redirect(login), cookieHeader);
  }

  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  if (user?.isBanned) {
    const suspended = new URL("/suspenso", req.nextUrl.origin);
    if (user.banReason) suspended.searchParams.set("motivo", user.banReason);
    return applyStaleSessionCleanup(
      clearSessionCookies(NextResponse.redirect(suspended), cookieHeader),
      cookieHeader,
      isAuthenticated,
    );
  }

  if (!MAINTENANCE_EXEMPT.test(pathname)) {
    const maintenanceOn = await isMaintenanceEnabled(req.nextUrl.origin);
    if (maintenanceOn && !isAdmin(user?.roles)) {
      return applyStaleSessionCleanup(
        NextResponse.redirect(new URL("/manutencao", req.nextUrl.origin)),
        cookieHeader,
        isAuthenticated,
      );
    }
  }

  if (MODERATOR_REQUIRED.test(pathname)) {
    const roles = user?.roles ?? [];
    if (!canModerate(roles)) {
      return applyStaleSessionCleanup(
        NextResponse.redirect(new URL("/", req.nextUrl.origin)),
        cookieHeader,
        isAuthenticated,
      );
    }
  }

  return applyStaleSessionCleanup(NextResponse.next(), cookieHeader, isAuthenticated);
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|limpar-sessao|.*\\..*).*)"],
};
