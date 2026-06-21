import { NOTIFICATION_DEDUPE_MINUTES } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { isNotificationTypeEnabled } from "@/services/notification-preferences.service";
import type { NotificationType } from "@prisma/client";

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  skipPreferenceCheck?: boolean;
  skipDedupe?: boolean;
};

export async function createNotification(input: CreateNotificationInput) {
  const link = input.link ?? null;

  if (!input.skipPreferenceCheck) {
    const enabled = await isNotificationTypeEnabled(input.userId, input.type, link);
    if (!enabled) return null;
  }

  if (!input.skipDedupe) {
    const dedupeMinutes = NOTIFICATION_DEDUPE_MINUTES[input.type];
    if (dedupeMinutes) {
      const since = new Date(Date.now() - dedupeMinutes * 60_000);
      const existing = await prisma.notification.findFirst({
        where: {
          userId: input.userId,
          type: input.type,
          ...(link ? { link } : {}),
          createdAt: { gte: since },
        },
        orderBy: { createdAt: "desc" },
      });
      if (existing) return existing;
    }
  }

  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link,
    },
  });
}

export async function getRecentNotifications(userId: string, limit = 10) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getNotificationsPage(
  userId: string,
  options: { limit?: number; unreadOnly?: boolean } = {},
) {
  const limit = options.limit ?? 30;

  return prisma.notification.findMany({
    where: {
      userId,
      ...(options.unreadOnly ? { readAt: null } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}

export async function markNotificationRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
