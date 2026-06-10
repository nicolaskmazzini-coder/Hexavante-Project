import { auth } from "@/auth";
import { markNotificationRead } from "@/services/notification.service";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  await markNotificationRead(id, session.user.id);
  return NextResponse.json({ success: true });
}
