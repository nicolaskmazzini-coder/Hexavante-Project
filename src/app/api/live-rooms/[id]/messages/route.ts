import { auth } from "@/auth";
import { getLiveChatMessagesSince } from "@/services/live-room.service";
import { NextResponse } from "next/server";

type Props = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const sinceParam = new URL(request.url).searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : undefined;

  if (since && Number.isNaN(since.getTime())) {
    return NextResponse.json({ error: "Parâmetro since inválido" }, { status: 400 });
  }

  try {
    const messages = await getLiveChatMessagesSince(id, session.user.id, since);

    return NextResponse.json(
    messages.map((msg) => ({
      id: msg.id,
      userId: msg.userId,
      username: msg.user.username,
      fullName: msg.user.fullName,
      message: msg.message,
      createdAt: msg.createdAt.toISOString(),
    })),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao buscar mensagens";
    const status = message.includes("acesso") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
