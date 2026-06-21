import crypto from "crypto";
import type { ActivityReactionType, Prisma } from "@prisma/client";
import { parseTags } from "@/lib/community";
import type { ActivityCommentView } from "@/lib/social";
import { filterProfanity } from "@/lib/profanity-filter";
import { prisma } from "@/lib/prisma";
import {
  enforceCleanContent,
} from "@/services/content-policy.service";
import { createNotification } from "@/services/notification.service";

const EMPTY_REACTIONS: Record<ActivityReactionType, number> = {
  CLAP: 0,
  FIRE: 0,
  IDEA: 0,
};

export async function createDiscussionPost(
  userId: string,
  input: { title: string; body: string; tags: string[] },
) {
  await enforceCleanContent({
    userId,
    text: input.title,
    fieldLabel: "título",
    context: "COMMUNITY_POST",
  });
  await enforceCleanContent({
    userId,
    text: input.body,
    fieldLabel: "descrição",
    context: "COMMUNITY_POST",
  });
  for (const tag of input.tags) {
    await enforceCleanContent({
      userId,
      text: tag,
      fieldLabel: "tag",
      context: "COMMUNITY_TAG",
    });
  }

  const sourceKey = `discussion:${crypto.randomUUID()}`;

  return prisma.socialActivity.create({
    data: {
      userId,
      type: "DISCUSSION",
      sourceKey,
      metadata: {
        title: input.title,
        body: input.body,
      },
      tags: input.tags,
    },
  });
}

export async function getActivityComments(
  activityId: string,
  viewerId?: string,
): Promise<ActivityCommentView[]> {
  const comments = await prisma.activityComment.findMany({
    where: { activityId },
    include: {
      user: {
        select: { id: true, username: true, fullName: true, avatarUrl: true },
      },
      _count: { select: { likes: true } },
      likes: viewerId
        ? { where: { userId: viewerId }, select: { userId: true } }
        : { take: 0, select: { userId: true } },
    },
    orderBy: [{ isAccepted: "desc" }, { likes: { _count: "desc" } }, { createdAt: "asc" }],
  });

  return comments.map((comment) => ({
    id: comment.id,
    content: filterProfanity(comment.content),
    isAccepted: comment.isAccepted,
    createdAt: comment.createdAt,
    likes: comment._count.likes,
    likedByViewer: viewerId ? comment.likes.length > 0 : false,
    user: comment.user,
  }));
}

export async function addActivityComment(
  activityId: string,
  userId: string,
  content: string,
) {
  const activity = await prisma.socialActivity.findUnique({
    where: { id: activityId },
    select: { userId: true, type: true },
  });

  if (!activity) throw new Error("Publicação não encontrada.");

  await enforceCleanContent({
    userId,
    text: content,
    fieldLabel: "comentário",
    context: "COMMUNITY_COMMENT",
  });

  const comment = await prisma.activityComment.create({
    data: { activityId, userId, content },
    include: {
      user: {
        select: { id: true, username: true, fullName: true, avatarUrl: true },
      },
      _count: { select: { likes: true } },
    },
  });

  if (activity.userId !== userId) {
    const authorName = comment.user.fullName || comment.user.username;
    await createNotification({
      userId: activity.userId,
      type: "COMMUNITY_REPLY",
      title: "Nova resposta na comunidade",
      message: `${authorName}: ${content.slice(0, 100)}${content.length > 100 ? "…" : ""}`,
      link: `/social?post=${activityId}`,
    });
  }

  return {
    id: comment.id,
    content: comment.content,
    isAccepted: comment.isAccepted,
    createdAt: comment.createdAt,
    likes: comment._count.likes,
    likedByViewer: false,
    user: comment.user,
  } satisfies ActivityCommentView;
}

export async function acceptActivityComment(
  activityId: string,
  commentId: string,
  ownerId: string,
) {
  const activity = await prisma.socialActivity.findUnique({
    where: { id: activityId },
    select: { userId: true, type: true },
  });

  if (!activity || activity.userId !== ownerId) {
    throw new Error("Somente o autor pode marcar a solução aceita.");
  }

  const comment = await prisma.activityComment.findFirst({
    where: { id: commentId, activityId },
    select: { userId: true, content: true },
  });

  if (!comment) throw new Error("Comentário não encontrado.");

  await prisma.$transaction([
    prisma.activityComment.updateMany({
      where: { activityId },
      data: { isAccepted: false },
    }),
    prisma.activityComment.update({
      where: { id: commentId },
      data: { isAccepted: true },
    }),
    prisma.socialActivity.update({
      where: { id: activityId },
      data: { acceptedCommentId: commentId },
    }),
  ]);

  if (comment.userId !== ownerId) {
    await createNotification({
      userId: comment.userId,
      type: "SOLUTION_ACCEPTED",
      title: "Sua resposta foi aceita",
      message: "O autor marcou sua resposta como solução.",
      link: `/social?post=${activityId}`,
    });
  }
}

export async function toggleCommentLike(commentId: string, userId: string) {
  const existing = await prisma.activityCommentLike.findUnique({
    where: { commentId_userId: { commentId, userId } },
  });

  if (existing) {
    await prisma.activityCommentLike.delete({ where: { id: existing.id } });
    return { liked: false };
  }

  await prisma.activityCommentLike.create({ data: { commentId, userId } });
  return { liked: true };
}

export async function toggleActivityReaction(
  activityId: string,
  userId: string,
  type: ActivityReactionType,
) {
  const existing = await prisma.activityReaction.findUnique({
    where: { activityId_userId_type: { activityId, userId, type } },
  });

  if (existing) {
    await prisma.activityReaction.delete({ where: { id: existing.id } });
    return { active: false };
  }

  await prisma.activityReaction.create({ data: { activityId, userId, type } });
  return { active: true };
}

export async function getReactionSummary(
  activityIds: string[],
  viewerId?: string,
): Promise<
  Map<
    string,
    {
      counts: Record<ActivityReactionType, number>;
      viewer: ActivityReactionType[];
    }
  >
> {
  if (activityIds.length === 0) return new Map();

  const reactions = await prisma.activityReaction.findMany({
    where: { activityId: { in: activityIds } },
    select: { activityId: true, type: true, userId: true },
  });

  const map = new Map<
    string,
    { counts: Record<ActivityReactionType, number>; viewer: ActivityReactionType[] }
  >();

  for (const id of activityIds) {
    map.set(id, { counts: { ...EMPTY_REACTIONS }, viewer: [] });
  }

  for (const reaction of reactions) {
    const entry = map.get(reaction.activityId);
    if (!entry) continue;
    entry.counts[reaction.type] += 1;
    if (viewerId && reaction.userId === viewerId) {
      entry.viewer.push(reaction.type);
    }
  }

  return map;
}

export async function getTrendingTags(limit = 8) {
  const posts = await prisma.socialActivity.findMany({
    where: { type: "DISCUSSION" },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { tags: true },
  });

  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of parseTags(post.tags)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

export async function getSuggestedCommunityUsers(viewerId?: string, limit = 5) {
  const followingIds = viewerId
    ? (
        await prisma.userFollow.findMany({
          where: { followerId: viewerId },
          select: { followingId: true },
        })
      ).map((row) => row.followingId)
    : [];

  return prisma.user.findMany({
    where: {
      profileVisibility: "public",
      ...(viewerId
        ? {
            id: { notIn: [viewerId, ...followingIds] },
          }
        : {}),
      socialActivities: { some: {} },
    },
    select: {
      id: true,
      username: true,
      fullName: true,
      avatarUrl: true,
      _count: { select: { followers: true, socialActivities: true } },
    },
    orderBy: { followers: { _count: "desc" } },
    take: limit,
  });
}

export async function canManageActivity(activityId: string, userId: string) {
  const activity = await prisma.socialActivity.findUnique({
    where: { id: activityId },
    select: { userId: true },
  });
  return activity?.userId === userId;
}
