import { auth } from "@/auth";
import {
  getRecentNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
} from "@/services/notification.service";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const [notifications, unreadCount] = await Promise.all([
    getRecentNotifications(session.user.id, 10),
    getUnreadNotificationCount(session.user.id),
  ]);

  return NextResponse.json({
    notifications: notifications.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      link: row.link,
      readAt: row.readAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    })),
    unreadCount,
  });
}

export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  await markAllNotificationsRead(session.user.id);
  return NextResponse.json({ success: true });
}
