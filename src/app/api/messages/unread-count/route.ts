import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUnreadDirectMessageCount } from "@/services/direct-message.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ unreadCount: 0 }, { status: 401 });
  }

  const unreadCount = await getUnreadDirectMessageCount(session.user.id);
  return NextResponse.json({ unreadCount });
}
