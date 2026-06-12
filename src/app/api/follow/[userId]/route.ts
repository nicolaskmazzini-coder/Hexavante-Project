import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { followUser, isFollowing, unfollowUser } from "@/services/follow.service";

type Params = { params: Promise<{ userId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  const { userId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ following: false });
  }

  const following = await isFollowing(session.user.id, userId);
  return NextResponse.json({ following });
}

export async function POST(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { userId } = await params;

  try {
    await followUser(session.user.id, userId);
    return NextResponse.json({ following: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao seguir" },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { userId } = await params;
  await unfollowUser(session.user.id, userId);
  return NextResponse.json({ following: false });
}
