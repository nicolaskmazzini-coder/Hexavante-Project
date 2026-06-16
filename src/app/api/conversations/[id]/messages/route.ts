import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getConversationMessages,
  markConversationRead,
  serializeDirectMessage,
} from "@/services/direct-message.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const sinceParam = searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : undefined;

  try {
    const messages = await getConversationMessages(id, session.user.id, { since, limit: 100 });
    if (!since) {
      await markConversationRead(id, session.user.id);
    }
    return NextResponse.json(messages.map(serializeDirectMessage));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao carregar mensagens." },
      { status: 404 },
    );
  }
}

export async function PATCH(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    await markConversationRead(id, session.user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao marcar como lida." },
      { status: 404 },
    );
  }
}
