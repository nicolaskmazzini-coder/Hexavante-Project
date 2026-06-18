import { auth } from "@/auth";
import { isAdmin } from "@/lib/permissions";
import { startImpersonation } from "@/services/impersonation.service";
import { executeModerationCommand } from "@/services/moderation-admin.service";
import { NextResponse } from "next/server";

// O terminal de moderação requer nível ADMIN ou SUPERADMIN — não apenas MODERATOR.
// Moderadores têm acesso ao painel, mas não ao terminal de comandos.
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || !isAdmin(session.user.roles)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  let body: { command?: string };
  try {
    body = (await request.json()) as { command?: string };
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  if (!body.command?.trim()) {
    return NextResponse.json({ error: "Comando vazio." }, { status: 400 });
  }

  // Limita tamanho do comando para evitar abusos
  if (body.command.length > 500) {
    return NextResponse.json({ error: "Comando muito longo." }, { status: 400 });
  }

  const result = await executeModerationCommand(
    body.command,
    session.user.id,
    session.user.roles ?? [],
  );

  const data = result.data as { action?: string; userId?: string; username?: string } | undefined;

  if (data?.action === "impersonate" && data.userId) {
    try {
      await startImpersonation(request, data.userId);
      return NextResponse.json({
        ...result,
        message: `✅ Agora você está vendo como @${data.username ?? "usuário"}. Recarregue a página se necessário.`,
        data: { ...data, redirect: "/" },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao impersonar.";
      return NextResponse.json({ status: "error", message: `❌ ${message}` }, { status: 403 });
    }
  }

  return NextResponse.json(result);
}
