import { auth } from "@/auth";
import { canModerate } from "@/lib/permissions";
import { getPlatformModerationStats } from "@/services/moderation-admin.service";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !canModerate(session.user.roles)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const stats = await getPlatformModerationStats();
  return NextResponse.json(stats);
}
