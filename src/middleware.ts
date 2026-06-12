import { auth } from "@/auth";
import { AUTH_SESSION_COOKIE_NAMES } from "@/lib/auth-env";
import { isStaff } from "@/lib/permissions";
import { NextResponse } from "next/server";

const MODERATOR_REQUIRED = /^\/moderacao(\/|$)/;

const MAINTENANCE_EXEMPT =
  /^\/(manutencao|suspenso|login|register|api\/auth|api\/platform)(\/|$)/;

const MAINTENANCE_CACHE_TTL_MS = 30_000;
let maintenanceCache: { enabled: boolean; at: number } | null = null;

function clearStaleSessionCookies(req: {
  auth: unknown;
  cookies: { get: (name: string) => { value: string } | undefined };
}) {
  const hasSessionCookie = AUTH_SESSION_COOKIE_NAMES.some((name) => req.cookies.get(name));
  if (!hasSessionCookie || req.auth) return null;

  const res = NextResponse.next();
  for (const name of AUTH_SESSION_COOKIE_NAMES) {
    res.cookies.delete(name);
  }
  return res;
}

function clearSessionCookies(response: NextResponse) {
  for (const name of AUTH_SESSION_COOKIE_NAMES) {
    response.cookies.delete(name);
  }
  return response;
}

async function isMaintenanceEnabled(origin: string): Promise<boolean> {
  if (maintenanceCache && Date.now() - maintenanceCache.at < MAINTENANCE_CACHE_TTL_MS) {
    return maintenanceCache.enabled;
  }

  try {
    const res = await fetch(`${origin}/api/platform/status`, { cache: "no-store" });
    if (!res.ok) return false;
    const data = (await res.json()) as { maintenance?: { enabled?: boolean } };
    const enabled = Boolean(data.maintenance?.enabled);
    maintenanceCache = { enabled, at: Date.now() };
    return enabled;
  } catch {
    return false;
  }
}

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const staleSessionResponse = clearStaleSessionCookies(req);
  if (staleSessionResponse) return staleSessionResponse;

  const user = req.auth?.user;

  if (user?.isBanned) {
    const suspended = new URL("/suspenso", req.nextUrl.origin);
    if (user.banReason) suspended.searchParams.set("motivo", user.banReason);
    return clearSessionCookies(NextResponse.redirect(suspended));
  }

  if (!MAINTENANCE_EXEMPT.test(pathname)) {
    const maintenanceOn = await isMaintenanceEnabled(req.nextUrl.origin);
    if (maintenanceOn && !isStaff(user?.roles)) {
      return NextResponse.redirect(new URL("/manutencao", req.nextUrl.origin));
    }
  }

  if (!MODERATOR_REQUIRED.test(pathname)) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  const roles = req.auth.user?.roles ?? [];
  if (!isStaff(roles)) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/moderacao/:path*",
    "/login",
    "/register",
    "/manutencao",
    "/suspenso",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
