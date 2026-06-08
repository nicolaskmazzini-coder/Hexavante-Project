import { auth } from "@/auth";
import { NextResponse } from "next/server";

const MODERATOR_REQUIRED = /^\/moderacao(\/|$)/;

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (!MODERATOR_REQUIRED.test(pathname)) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  const roles = req.auth.user?.roles ?? [];
  if (!roles.includes("MODERATOR") && !roles.includes("ADMIN")) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/moderacao/:path*"],
};
