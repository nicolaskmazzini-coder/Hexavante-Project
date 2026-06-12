import { auth } from "@/auth";
import { canModerate } from "@/lib/permissions";
import { listModerationLogs } from "@/services/moderation-admin.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !canModerate(session.user.roles)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const logs = await listModerationLogs({
    type: searchParams.get("type") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    limit: Number(searchParams.get("limit") ?? 100),
  });

  return NextResponse.json({ logs });
}
