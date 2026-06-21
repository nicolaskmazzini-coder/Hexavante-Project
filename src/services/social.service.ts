import type { ActivityReactionType, Prisma, SocialActivityType } from "@prisma/client";
import type { FeedActivity, FeedEventMetadata } from "@/lib/social";
import { parseTags } from "@/lib/community";
import { filterProfanity } from "@/lib/profanity-filter";
import { prisma } from "@/lib/prisma";
import { getReactionSummary } from "@/services/community.service";

function parseMetadata(value: Prisma.JsonValue): FeedEventMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const metadata = value as FeedEventMetadata;
  return {
    ...metadata,
    title: metadata.title ? filterProfanity(metadata.title) : metadata.title,
    body: metadata.body ? filterProfanity(metadata.body) : metadata.body,
  };
}

export async function recordSocialActivity(
  userId: string,
  type: SocialActivityType,
  metadata: FeedEventMetadata,
  sourceKey: string,
) {
  try {
    return await prisma.socialActivity.upsert({
      where: {
        userId_sourceKey: { userId, sourceKey },
      },
      create: {
        userId,
        type,
        sourceKey,
        metadata: metadata as Prisma.InputJsonValue,
      },
      update: {},
    });
  } catch {
    return null;
  }
}

export async function syncUserActivitiesFromHistory(userId: string) {
  const [certificates, passedAttempts, xpProfile] = await Promise.all([
    prisma.certificate.findMany({
      where: { userId },
      include: { course: { select: { title: true, slug: true } } },
      orderBy: { issuedAt: "desc" },
      take: 20,
    }),
    prisma.examAttempt.findMany({
      where: {
        userId,
        finishedAt: { not: null },
        score: { gte: 70 },
      },
      include: { exam: { select: { title: true, slug: true } } },
      orderBy: { finishedAt: "desc" },
      take: 20,
    }),
    prisma.userXP.findUnique({ where: { userId } }),
  ]);

  for (const cert of certificates) {
    await recordSocialActivity(
      userId,
      "COURSE_COMPLETED",
      { course: cert.course.title, courseSlug: cert.course.slug },
      `cert:${cert.id}`,
    );
  }

  for (const attempt of passedAttempts) {
    await recordSocialActivity(
      userId,
      "SIMULADO_PASSED",
      {
        simulado: attempt.exam.title,
        simuladoSlug: attempt.exam.slug,
        score: attempt.score ?? 0,
      },
      `exam:${attempt.id}`,
    );
  }

  if (xpProfile && xpProfile.level > 1) {
    await recordSocialActivity(
      userId,
      "LEVEL_UP",
      { newLevel: xpProfile.level },
      `level:${xpProfile.level}`,
    );
  }
}

async function mapActivities(
  rows: Array<{
    id: string;
    type: SocialActivityType;
    metadata: Prisma.JsonValue;
    tags: Prisma.JsonValue | null;
    acceptedCommentId: string | null;
    createdAt: Date;
    user: {
      id: string;
      username: string;
      fullName: string;
      avatarUrl: string | null;
    };
    _count: { likes: number; comments: number };
    likes: Array<{ userId: string }>;
  }>,
  viewerId?: string,
  reactionMap?: Map<
    string,
    { counts: Record<ActivityReactionType, number>; viewer: ActivityReactionType[] }
  >,
): Promise<FeedActivity[]> {
  return rows.map((row) => {
    const reactions = reactionMap?.get(row.id);
    return {
      id: row.id,
      type: row.type,
      metadata: parseMetadata(row.metadata),
      tags: parseTags(row.tags),
      acceptedCommentId: row.acceptedCommentId,
      createdAt: row.createdAt,
      likes: row._count.likes,
      comments: row._count.comments,
      likedByViewer: viewerId ? row.likes.some((like) => like.userId === viewerId) : false,
      reactions: reactions?.counts ?? { CLAP: 0, FIRE: 0, IDEA: 0 },
      viewerReactions: reactions?.viewer ?? [],
      user: {
        ...row.user,
        fullName: filterProfanity(row.user.fullName),
      },
    };
  });
}

export async function getUserActivities(userId: string, viewerId?: string, limit = 20) {
  await syncUserActivitiesFromHistory(userId);

  const rows = await prisma.socialActivity.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: {
        select: { id: true, username: true, fullName: true, avatarUrl: true },
      },
      _count: { select: { likes: true, comments: true } },
      likes: viewerId
        ? { where: { userId: viewerId }, select: { userId: true } }
        : { take: 0, select: { userId: true } },
    },
  });

  const reactionMap = await getReactionSummary(
    rows.map((row) => row.id),
    viewerId,
  );

  return mapActivities(rows, viewerId, reactionMap);
}

export type SocialFeedMode = "explore" | "following" | "questions";

export type SocialFeedOptions = {
  mode: SocialFeedMode;
  viewerId?: string;
  limit?: number;
  tag?: string;
};

function buildFeedWhere(mode: SocialFeedMode, userIds?: string[]): Prisma.SocialActivityWhereInput {
  const base: Prisma.SocialActivityWhereInput = {
    ...(mode === "questions" ? { type: "DISCUSSION" } : {}),
  };

  if (userIds) {
    return { ...base, userId: { in: userIds } };
  }

  return base;
}

async function fetchFeedRows(where: Prisma.SocialActivityWhereInput, viewerId: string | undefined, limit: number) {
  return prisma.socialActivity.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: {
        select: { id: true, username: true, fullName: true, avatarUrl: true },
      },
      _count: { select: { likes: true, comments: true } },
      likes: viewerId
        ? { where: { userId: viewerId }, select: { userId: true } }
        : { take: 0, select: { userId: true } },
    },
  });
}

export async function getSocialFeed(
  modeOrLegacy: SocialFeedMode | "explore" | "following",
  viewerId?: string,
  limit = 30,
  tag?: string,
) {
  const mode = modeOrLegacy;
  const options: SocialFeedOptions = { mode, viewerId, limit, tag };
  return getSocialFeedAdvanced(options);
}

export async function getSocialFeedAdvanced({
  mode,
  viewerId,
  limit = 30,
  tag,
}: SocialFeedOptions) {
  if (mode === "following") {
    if (!viewerId) return [];

    const followingIds = await prisma.userFollow.findMany({
      where: { followerId: viewerId },
      select: { followingId: true },
    });

    const userIds = followingIds.map((row) => row.followingId);
    if (userIds.length === 0) return [];

    await Promise.all(userIds.map((id) => syncUserActivitiesFromHistory(id)));

    const rows = await fetchFeedRows(buildFeedWhere(mode, userIds), viewerId, limit);
    const filtered = tag
      ? rows.filter((row) => parseTags(row.tags).includes(tag))
      : rows;
    const reactionMap = await getReactionSummary(
      filtered.map((row) => row.id),
      viewerId,
    );
    return mapActivities(filtered, viewerId, reactionMap);
  }

  const recentUsers = await prisma.socialActivity.findMany({
    distinct: ["userId"],
    orderBy: { createdAt: "desc" },
    take: 15,
    select: { userId: true },
  });

  if (mode === "explore") {
    await Promise.all(recentUsers.map((row) => syncUserActivitiesFromHistory(row.userId)));
  }

  const rows = await fetchFeedRows(buildFeedWhere(mode), viewerId, tag ? limit * 3 : limit);
  const filtered = tag ? rows.filter((row) => parseTags(row.tags).includes(tag)).slice(0, limit) : rows;
  const reactionMap = await getReactionSummary(
    filtered.map((row) => row.id),
    viewerId,
  );
  return mapActivities(filtered, viewerId, reactionMap);
}

export async function toggleActivityLike(activityId: string, userId: string) {
  const existing = await prisma.activityLike.findUnique({
    where: {
      activityId_userId: { activityId, userId },
    },
  });

  if (existing) {
    await prisma.activityLike.delete({ where: { id: existing.id } });
    return { liked: false };
  }

  await prisma.activityLike.create({
    data: { activityId, userId },
  });
  return { liked: true };
}
