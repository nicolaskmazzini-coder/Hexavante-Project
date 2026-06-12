import { auth } from "@/auth";

import { canModerate } from "@/lib/permissions";

import { startImpersonation } from "@/services/impersonation.service";

import { executeModerationCommand } from "@/services/moderation-admin.service";

import { NextResponse } from "next/server";



export async function POST(request: Request) {

  const session = await auth();

  if (!session?.user?.id || !canModerate(session.user.roles)) {

    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });

  }



  const body = (await request.json()) as { command?: string };

  if (!body.command?.trim()) {

    return NextResponse.json({ error: "Comando vazio." }, { status: 400 });

  }



  const result = await executeModerationCommand(

    body.command,

    session.user.id,

    session.user.roles ?? [],

  );



  const data = result.data as { action?: string; userId?: string } | undefined;

  if (data?.action === "impersonate" && data.userId) {

    try {

      await startImpersonation(request, data.userId);

      return NextResponse.json({

        ...result,

        message: `✅ Agora você está vendo como @${(data as { username?: string }).username ?? "usuário"}. Recarregue a página se necessário.`,

        data: { ...data, redirect: "/" },

      });

    } catch (error) {

      const message = error instanceof Error ? error.message : "Erro ao impersonar.";

      return NextResponse.json({ status: "error", message: `❌ ${message}` }, { status: 403 });

    }

  }



  return NextResponse.json(result);

}


