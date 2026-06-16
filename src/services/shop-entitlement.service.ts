import { prisma } from "@/lib/prisma";
import { isInventoryEntryActive } from "@/lib/shop-item-utils";
import type { StoreItemCategory } from "@prisma/client";

type PassMetadata = {
  passType?: "premium_exams" | "early_exam";
  examSlug?: string;
  durationDays?: number;
};

export async function getActiveInventoryEntries(
  userId: string,
  category?: StoreItemCategory,
) {
  const now = new Date();
  return prisma.userInventory.findMany({
    where: {
      userId,
      ...(category ? { storeItem: { category, isActive: true } } : { storeItem: { isActive: true } }),
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    include: { storeItem: true },
    orderBy: { purchasedAt: "desc" },
  });
}

export async function hasActivePassForPremiumExams(userId: string): Promise<boolean> {
  const passes = await getActiveInventoryEntries(userId, "PASS");
  return passes.some((entry) => {
    const meta = entry.storeItem.metadata as PassMetadata | null;
    return meta?.passType === "premium_exams";
  });
}

export async function hasActivePassForExam(userId: string, examSlug: string): Promise<boolean> {
  const passes = await getActiveInventoryEntries(userId, "PASS");
  return passes.some((entry) => {
    const meta = entry.storeItem.metadata as PassMetadata | null;
    return meta?.passType === "early_exam" && meta.examSlug === examSlug;
  });
}

export async function canAccessExamWithShopPasses(
  userId: string,
  exam: { slug: string; isPremiumOnly: boolean },
): Promise<boolean> {
  if (!exam.isPremiumOnly) return false;

  if (await hasActivePassForPremiumExams(userId)) return true;
  return hasActivePassForExam(userId, exam.slug);
}

export async function getActiveReviewPackSlugs(userId: string): Promise<string[]> {
  const packs = await getActiveInventoryEntries(userId, "REVIEW_PACK");
  return packs.map((entry) => entry.storeItem.slug);
}

export async function hasActiveReviewPack(userId: string, packSlug: string): Promise<boolean> {
  const entry = await prisma.userInventory.findFirst({
    where: {
      userId,
      storeItem: { slug: packSlug, category: "REVIEW_PACK", isActive: true },
    },
    include: { storeItem: true },
  });
  if (!entry) return false;
  return isInventoryEntryActive(entry.expiresAt);
}
