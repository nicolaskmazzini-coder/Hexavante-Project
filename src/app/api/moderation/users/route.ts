import { auth } from "@/auth";
import { canModerate } from "@/lib/permissions";
import { listModerationUsers } from "@/services/moderation-admin.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !canModerate(session.user.roles)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const users = await listModerationUsers({
    search: searchParams.get("search") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    role: searchParams.get("role") ?? undefined,
    limit: Number(searchParams.get("limit") ?? 50),
  });

  return NextResponse.json({ users });
}
