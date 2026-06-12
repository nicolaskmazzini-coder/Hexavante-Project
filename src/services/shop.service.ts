import { getAvatarBorderClassName, resolveAppTheme } from "@/lib/cosmetics";
import { buildPremiumStatus } from "@/lib/premium";
import { prisma } from "@/lib/prisma";
import { SHOP_CATALOG } from "@/lib/shop-catalog";
import { activateBooster } from "@/services/booster.service";
import { getUserCoinProfile, spendCoins } from "@/services/wallet.service";
import type { StoreItemCategory } from "@prisma/client";

const DEPRECATED_SHOP_SLUGS = ["booster-coins-24h"];

export async function ensureShopCatalog() {
  if (DEPRECATED_SHOP_SLUGS.length > 0) {
    await prisma.storeItem.updateMany({
      where: { slug: { in: DEPRECATED_SHOP_SLUGS } },
      data: { isActive: false },
    });
  }

  for (const item of SHOP_CATALOG) {
    await prisma.storeItem.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        cost: item.cost,
        category: item.category,
        imageUrl: item.imageUrl ?? null,
        isPremiumOnly: item.isPremiumOnly ?? false,
        metadata: item.metadata ?? undefined,
        isActive: true,
      },
      create: {
        slug: item.slug,
        name: item.name,
        description: item.description,
        cost: item.cost,
        category: item.category,
        imageUrl: item.imageUrl ?? null,
        isPremiumOnly: item.isPremiumOnly ?? false,
        metadata: item.metadata ?? undefined,
      },
    });
  }
}

export async function listShopItems(category?: StoreItemCategory) {
  await ensureShopCatalog();
  return prisma.storeItem.findMany({
    where: {
      isActive: true,
      ...(category ? { category } : {}),
    },
    orderBy: [{ category: "asc" }, { cost: "asc" }],
  });
}

export async function getUserInventory(userId: string) {
  return prisma.userInventory.findMany({
    where: { userId },
    include: { storeItem: true },
    orderBy: { purchasedAt: "desc" },
  });
}

export async function getEquippedItems(userId: string) {
  const now = new Date();
  return prisma.userInventory.findMany({
    where: {
      userId,
      isEquipped: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    include: { storeItem: true },
  });
}

export async function getShopState(userId: string) {
  const [items, inventory, coinProfile, user] = await Promise.all([
    listShopItems(),
    getUserInventory(userId),
    getUserCoinProfile(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true, premiumExpiresAt: true },
    }),
  ]);

  const premium = user ? buildPremiumStatus(user) : null;
  const ownedIds = new Set(inventory.map((entry) => entry.storeItemId));
  const equippedByItem = new Map(inventory.map((entry) => [entry.storeItemId, entry.isEquipped]));

  return {
    items,
    inventory,
    coins: coinProfile.coins,
    premium,
    coinMultiplier: coinProfile.coinMultiplier,
    activeBooster: coinProfile.activeBooster,
    ownedIds,
    equippedByItem,
  };
}

export async function purchaseStoreItem(userId: string, storeItemId: string) {
  const item = await prisma.storeItem.findFirst({
    where: { id: storeItemId, isActive: true },
  });
  if (!item) {
    throw new Error("Item não encontrado.");
  }

  const existing = await prisma.userInventory.findUnique({
    where: { userId_storeItemId: { userId, storeItemId } },
  });
  if (existing) {
    throw new Error("Você já possui este item.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true, premiumExpiresAt: true, coins: true },
  });
  if (!user) throw new Error("Usuário não encontrado.");

  const premium = buildPremiumStatus(user);
  if (item.isPremiumOnly && !premium.isActive) {
    throw new Error("Este item é exclusivo para assinantes Premium.");
  }

  const isFreeForPremium = item.isPremiumOnly && premium.isActive;
  const finalCost = isFreeForPremium ? 0 : item.cost;

  if (finalCost > 0 && user.coins < finalCost) {
    throw new Error("Moedas insuficientes.");
  }

  if (finalCost > 0) {
    const spent = await spendCoins(
      userId,
      finalCost,
      "SHOP_PURCHASE",
      storeItemId,
      `Compra: ${item.name}`,
    );
    if (!spent) throw new Error("Não foi possível processar o pagamento.");
  }

  let boosterExpiresAt: Date | null = null;

  if (item.category === "BOOSTER") {
    const meta = item.metadata as { multiplier?: number; durationHours?: number } | null;
    const booster = await activateBooster(
      userId,
      meta?.multiplier ?? 2,
      meta?.durationHours ?? 24,
    );
    boosterExpiresAt = booster.expiresAt;
  }

  const inventory = await prisma.userInventory.create({
    data: {
      userId,
      storeItemId,
      isEquipped: item.category === "BOOSTER",
      expiresAt: boosterExpiresAt,
    },
    include: { storeItem: true },
  });

  return inventory;
}

const EQUIPPABLE_CATEGORIES: StoreItemCategory[] = [
  "TITLE",
  "AVATAR_BORDER",
  "THEME",
  "COSMETIC",
];

export async function equipStoreItem(userId: string, inventoryId: string) {
  const entry = await prisma.userInventory.findFirst({
    where: { id: inventoryId, userId },
    include: { storeItem: true },
  });
  if (!entry) throw new Error("Item não encontrado no inventário.");
  if (!EQUIPPABLE_CATEGORIES.includes(entry.storeItem.category)) {
    throw new Error("Este item não pode ser equipado.");
  }
  if (entry.expiresAt && entry.expiresAt <= new Date()) {
    throw new Error("Este item expirou.");
  }

  await prisma.$transaction(async (tx) => {
    const sameCategory = await tx.userInventory.findMany({
      where: {
        userId,
        storeItem: { category: entry.storeItem.category },
      },
    });

    for (const item of sameCategory) {
      await tx.userInventory.update({
        where: { id: item.id },
        data: { isEquipped: item.id === inventoryId },
      });
    }
  });

  return prisma.userInventory.findUnique({
    where: { id: inventoryId },
    include: { storeItem: true },
  });
}

export async function getProfileCosmetics(userId: string) {
  const equipped = await getEquippedItems(userId);
  const title = equipped.find((e) => e.storeItem.category === "TITLE");
  const border = equipped.find((e) => e.storeItem.category === "AVATAR_BORDER");
  const theme = equipped.find((e) => e.storeItem.category === "THEME");

  const titleMeta = title?.storeItem.metadata as { titleText?: string } | null;
  const borderMeta = border?.storeItem.metadata as { borderId?: string; rarity?: string } | null;
  const themeMeta = theme?.storeItem.metadata as { themeId?: string } | null;
  const themeId = themeMeta?.themeId ?? null;
  const borderId = borderMeta?.borderId ?? null;
  const appTheme = resolveAppTheme(themeId);

  return {
    equippedTitle: titleMeta?.titleText ?? title?.storeItem.name ?? null,
    borderId,
    avatarBorderClassName: getAvatarBorderClassName(borderId),
    themeId,
    themeClassName: appTheme.className,
    themeVars: appTheme.vars,
  };
}
