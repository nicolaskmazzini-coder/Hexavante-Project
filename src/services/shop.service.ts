import {
  getAvatarBorderClassName,
  resolveAppTheme,
  resolveProfileIcon,
} from "@/lib/cosmetics";
import { buildPremiumStatus } from "@/lib/premium";
import { prisma } from "@/lib/prisma";
import { SHOP_CATALOG } from "@/lib/shop-catalog";
import {
  computeTemporaryExpiry,
  getShopOwnershipStatus,
  type ShopOwnershipStatus,
} from "@/lib/shop-item-utils";
import { activateBooster } from "@/services/booster.service";
import { getUserCoinProfile, spendCoins } from "@/services/wallet.service";
import type { StoreItem, StoreItemCategory } from "@prisma/client";

const DEPRECATED_SHOP_SLUGS = ["booster-coins-24h"];

type TemporaryMetadata = {
  multiplier?: number;
  durationHours?: number;
  durationDays?: number;
};

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
        isPermanent: item.isPermanent ?? true,
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
        isPermanent: item.isPermanent ?? true,
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

export type ShopItemView = StoreItem & {
  ownershipStatus: ShopOwnershipStatus;
  inventoryId?: string;
  isEquipped: boolean;
  expiresAt: Date | null;
};

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
  const inventoryByItem = new Map(inventory.map((entry) => [entry.storeItemId, entry]));

  const itemViews: ShopItemView[] = items.map((item) => {
    const entry = inventoryByItem.get(item.id);
    const ownershipStatus = getShopOwnershipStatus(item.isPermanent, entry);
    return {
      ...item,
      ownershipStatus,
      inventoryId: entry?.id,
      isEquipped: entry?.isEquipped ?? false,
      expiresAt: entry?.expiresAt ?? null,
    };
  });

  return {
    items: itemViews,
    inventory,
    coins: coinProfile.coins,
    premium,
    coinMultiplier: coinProfile.coinMultiplier,
    activeBooster: coinProfile.activeBooster,
  };
}

async function chargeForItem(
  userId: string,
  item: StoreItem,
  premiumActive: boolean,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { coins: true },
  });
  if (!user) throw new Error("Usuário não encontrado.");

  const isFreeForPremium = item.isPremiumOnly && premiumActive;
  const finalCost = isFreeForPremium ? 0 : item.cost;

  if (finalCost > 0 && user.coins < finalCost) {
    throw new Error("Moedas insuficientes.");
  }

  if (finalCost > 0) {
    const spent = await spendCoins(
      userId,
      finalCost,
      "SHOP_PURCHASE",
      item.id,
      `Compra: ${item.name}`,
    );
    if (!spent) throw new Error("Não foi possível processar o pagamento.");
  }
}

function resolveTemporaryExpiry(item: StoreItem, baseDate = new Date()) {
  const meta = item.metadata as TemporaryMetadata | null;
  return computeTemporaryExpiry(meta?.durationHours, meta?.durationDays, baseDate);
}

async function applyTemporaryPurchaseEffects(userId: string, item: StoreItem, baseDate: Date) {
  if (item.category === "BOOSTER") {
    const meta = item.metadata as TemporaryMetadata | null;
    const booster = await activateBooster(
      userId,
      meta?.multiplier ?? 2,
      meta?.durationHours ?? (meta?.durationDays ? meta.durationDays * 24 : 24),
    );
    return booster.expiresAt;
  }

  if (item.category === "PASS" || item.category === "REVIEW_PACK") {
    return resolveTemporaryExpiry(item, baseDate);
  }

  return null;
}

async function repurchaseTemporaryItem(
  userId: string,
  item: StoreItem,
  existingId: string,
  premiumActive: boolean,
) {
  await chargeForItem(userId, item, premiumActive);

  const existing = await prisma.userInventory.findUnique({ where: { id: existingId } });
  const baseDate =
    existing?.expiresAt && existing.expiresAt > new Date() ? existing.expiresAt : new Date();
  const expiresAt = await applyTemporaryPurchaseEffects(userId, item, baseDate);

  return prisma.userInventory.update({
    where: { id: existingId },
    data: {
      purchasedAt: new Date(),
      expiresAt,
      isEquipped: item.category === "BOOSTER" ? true : false,
    },
    include: { storeItem: true },
  });
}

export async function purchaseStoreItem(userId: string, storeItemId: string) {
  const item = await prisma.storeItem.findFirst({
    where: { id: storeItemId, isActive: true },
  });
  if (!item) {
    throw new Error("Item não encontrado.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true, premiumExpiresAt: true },
  });
  if (!user) throw new Error("Usuário não encontrado.");

  const premium = buildPremiumStatus(user);
  if (item.isPremiumOnly && !premium.isActive) {
    throw new Error("Este item é exclusivo para assinantes Premium.");
  }

  const existing = await prisma.userInventory.findUnique({
    where: { userId_storeItemId: { userId, storeItemId } },
  });

  if (existing) {
    if (item.isPermanent) {
      throw new Error("Você já possui este item.");
    }
    return repurchaseTemporaryItem(userId, item, existing.id, premium.isActive);
  }

  await chargeForItem(userId, item, premium.isActive);

  let expiresAt: Date | null = null;
  if (!item.isPermanent) {
    expiresAt = await applyTemporaryPurchaseEffects(userId, item, new Date());
  }

  return prisma.userInventory.create({
    data: {
      userId,
      storeItemId,
      isEquipped: item.category === "BOOSTER",
      expiresAt,
    },
    include: { storeItem: true },
  });
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
  const cosmetic = equipped.find((e) => e.storeItem.category === "COSMETIC");

  const titleMeta = title?.storeItem.metadata as { titleText?: string } | null;
  const borderMeta = border?.storeItem.metadata as { borderId?: string; rarity?: string } | null;
  const themeMeta = theme?.storeItem.metadata as { themeId?: string } | null;
  const cosmeticMeta = cosmetic?.storeItem.metadata as {
    cosmeticType?: string;
    iconId?: string;
  } | null;

  const themeId = themeMeta?.themeId ?? null;
  const borderId = borderMeta?.borderId ?? null;
  const profileIconId =
    cosmeticMeta?.cosmeticType === "profile_icon" ? (cosmeticMeta.iconId ?? null) : null;
  const appTheme = resolveAppTheme(themeId);

  return {
    equippedTitle: titleMeta?.titleText ?? title?.storeItem.name ?? null,
    borderId,
    avatarBorderClassName: getAvatarBorderClassName(borderId),
    profileIconId,
    profileIcon: resolveProfileIcon(profileIconId),
    themeId,
    themeClassName: appTheme.className,
    themeVars: appTheme.vars,
  };
}
