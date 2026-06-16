import { prisma } from "@/lib/prisma";
import { hasActiveReviewPack } from "@/services/shop-entitlement.service";

type ReviewPackMetadata = {
  topic?: string;
  examSlugs?: string[];
  questionCount?: number;
  durationDays?: number;
};

export async function getReviewPackContent(userId: string, packSlug: string) {
  const storeItem = await prisma.storeItem.findFirst({
    where: { slug: packSlug, category: "REVIEW_PACK", isActive: true },
  });
  if (!storeItem) return null;

  const hasAccess = await hasActiveReviewPack(userId, packSlug);
  if (!hasAccess) return null;

  const inventory = await prisma.userInventory.findFirst({
    where: { userId, storeItemId: storeItem.id },
  });

  const meta = storeItem.metadata as ReviewPackMetadata | null;
  const examSlugs = meta?.examSlugs ?? [];
  const questionCount = Math.max(1, meta?.questionCount ?? 10);

  const exams = await prisma.exam.findMany({
    where: { slug: { in: examSlugs }, isPublished: true },
    select: {
      id: true,
      title: true,
      slug: true,
      questions: {
        orderBy: { orderNumber: "asc" },
        take: questionCount,
        select: {
          id: true,
          statement: true,
          orderNumber: true,
          alternatives: {
            select: { id: true, text: true, isCorrect: true },
          },
        },
      },
    },
  });

  const questions = exams.flatMap((exam) =>
    exam.questions.map((question) => ({
      ...question,
      examTitle: exam.title,
      examSlug: exam.slug,
    })),
  );

  return {
    storeItem,
    inventory,
    topic: meta?.topic ?? storeItem.name,
    questions: questions.slice(0, questionCount),
  };
}
