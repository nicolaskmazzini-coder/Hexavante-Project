import { auth } from "@/auth";
import {
  getRealRolesFromToken,
  startImpersonation,
  stopImpersonation,
} from "@/services/impersonation.service";
import { isSuperAdmin } from "@/lib/moderation/permissions";
import { getAuthSecret } from "@/lib/auth-env";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

function getSessionCookieName(): string {
  return process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";
}

async function assertSuperAdmin(request: Request) {
  const token = await getToken({
    req: request,
    secret: getAuthSecret(),
    salt: getSessionCookieName(),
  });
  const realRoles = getRealRolesFromToken(token);
  if (!isSuperAdmin(realRoles)) {
    throw new Error("Apenas superadmin pode impersonar usuários.");
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    await assertSuperAdmin(request);
    const body = (await request.json()) as { userId?: string };
    if (!body.userId) {
      return NextResponse.json({ error: "userId obrigatório." }, { status: 400 });
    }

    const result = await startImpersonation(request, body.userId);
    return NextResponse.json({
      status: "success",
      message: `Visualizando como @${result.username}`,
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao impersonar.";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const result = await stopImpersonation(request);
    return NextResponse.json({
      status: "success",
      message: `Sessão restaurada como @${result.username}`,
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao sair da impersonação.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
