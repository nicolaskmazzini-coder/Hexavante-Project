import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ContentPolicyError } from "@/lib/profanity-filter";
import {
  getConversationMessages,
  markConversationRead,
  sendDirectMessage,
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

export async function POST(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await context.params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const body =
    payload && typeof payload === "object" && "body" in payload
      ? String((payload as { body: unknown }).body ?? "")
      : "";

  try {
    const message = await sendDirectMessage(id, session.user.id, body);
    return NextResponse.json(serializeDirectMessage(message));
  } catch (err) {
    if (err instanceof ContentPolicyError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }

    const message = err instanceof Error ? err.message : "Erro ao enviar mensagem.";
    const status = message.includes("não encontrada") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
