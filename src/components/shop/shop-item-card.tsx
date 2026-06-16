"use client";

import { useActionState } from "react";
import { BookOpen, Coins, Crown, Sparkles, Ticket, Zap } from "lucide-react";
import {
  equipItemAction,
  purchaseItemAction,
  type ShopActionResult,
} from "@/app/actions/shop";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RARITY_LABELS } from "@/lib/cosmetics";
import { STORE_CATEGORY_LABELS } from "@/lib/shop-catalog";
import {
  formatExpirationDate,
  SHOP_OWNERSHIP_LABELS,
  type ShopOwnershipStatus,
} from "@/lib/shop-item-utils";
import type { StoreItemCategory } from "@prisma/client";

type ShopItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  cost: number;
  category: StoreItemCategory;
  isPremiumOnly: boolean;
  isPermanent: boolean;
  metadata?: {
    borderId?: string;
    rarity?: string;
    themeId?: string;
    multiplier?: number;
    durationHours?: number;
    durationDays?: number;
    affects?: string[];
    passType?: string;
    topic?: string;
  } | null;
};

type Props = {
  item: ShopItem;
  ownershipStatus: ShopOwnershipStatus;
  equipped: boolean;
  inventoryId?: string;
  expiresAt?: Date | string | null;
  userCoins: number;
  isPremium: boolean;
};

const initial: ShopActionResult = { success: false };

const CATEGORY_ICONS: Record<StoreItemCategory, typeof Coins> = {
  BOOSTER: Zap,
  TITLE: Crown,
  AVATAR_BORDER: Crown,
  THEME: Crown,
  COSMETIC: Sparkles,
  PASS: Ticket,
  REVIEW_PACK: BookOpen,
};

const OWNERSHIP_BADGE_VARIANT: Record<
  ShopOwnershipStatus,
  "default" | "emerald" | "amber" | "violet"
> = {
  available: "default",
  owned_permanent: "emerald",
  active_temporary: "violet",
  expired_temporary: "amber",
};

export function ShopItemCard({
  item,
  ownershipStatus,
  equipped,
  inventoryId,
  expiresAt,
  userCoins,
  isPremium,
}: Props) {
  const [purchaseState, purchase, purchasing] = useActionState(purchaseItemAction, initial);
  const [equipState, equip, equipping] = useActionState(equipItemAction, initial);

  const Icon = CATEGORY_ICONS[item.category];
  const rarity = item.metadata?.rarity as keyof typeof RARITY_LABELS | undefined;
  const isFreePremium = item.isPremiumOnly && isPremium;
  const canAfford = isFreePremium || item.cost <= userCoins;
  const error = purchaseState.error || equipState.error;

  const isOwned =
    ownershipStatus === "owned_permanent" || ownershipStatus === "active_temporary";
  const canBuy =
    ownershipStatus === "available" ||
    ownershipStatus === "expired_temporary" ||
    (!item.isPermanent && ownershipStatus === "active_temporary");

  const isEquippable = ["TITLE", "AVATAR_BORDER", "THEME", "COSMETIC"].includes(item.category);

  const durationLabel = item.metadata?.durationDays
    ? `${item.metadata.durationDays} dias`
    : item.metadata?.durationHours
      ? `${item.metadata.durationHours}h`
      : null;

  const boosterAffects =
    item.category === "BOOSTER"
      ? item.metadata?.affects?.includes("xp") && !item.metadata?.affects?.includes("coins")
        ? "2x XP"
        : "2x moedas + XP"
      : null;

  return (
    <Card
      className={`flex h-full flex-col border bg-white/[0.04] p-5 ${
        isOwned ? "border-emerald-400/25" : "border-white/10"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10 text-amber-200">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge variant={item.isPremiumOnly ? "violet" : "default"}>
            {STORE_CATEGORY_LABELS[item.category]}
          </Badge>
          <Badge variant={OWNERSHIP_BADGE_VARIANT[ownershipStatus]}>
            {SHOP_OWNERSHIP_LABELS[ownershipStatus]}
          </Badge>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-bold text-white">{item.name}</h3>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            item.isPermanent
              ? "border-sky-400/25 bg-sky-500/10 text-sky-200"
              : "border-amber-400/25 bg-amber-500/10 text-amber-200"
          }`}
        >
          {item.isPermanent ? "Permanente" : "Temporário"}
        </span>
        {rarity && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-300">
            {RARITY_LABELS[rarity] ?? rarity}
          </span>
        )}
        {boosterAffects && (
          <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-200">
            {boosterAffects}
          </span>
        )}
        {durationLabel && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-slate-300">
            {durationLabel}
          </span>
        )}
      </div>

      <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{item.description}</p>

      {ownershipStatus === "active_temporary" && expiresAt && (
        <p className="mt-2 text-xs text-violet-200">
          Válido até {formatExpirationDate(expiresAt)}
        </p>
      )}
      {ownershipStatus === "expired_temporary" && (
        <p className="mt-2 text-xs text-amber-300">Expirado — você pode renovar a compra.</p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        {item.isPremiumOnly ? (
          <span className="text-sm font-semibold text-fuchsia-200">
            {isPremium ? "Grátis para Premium" : "Exclusivo Premium"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-200">
            <Coins className="h-4 w-4" />
            {item.cost.toLocaleString("pt-BR")}
          </span>
        )}

        {isOwned && item.category === "REVIEW_PACK" && ownershipStatus === "active_temporary" ? (
          <LinkButton href={`/pacotes-revisao/${item.slug}`} className="min-h-9">
            Acessar pacote
          </LinkButton>
        ) : isOwned && item.category === "BOOSTER" ? (
          <span className="text-sm font-semibold text-emerald-300">
            {ownershipStatus === "active_temporary" ? "Booster ativo" : "No inventário"}
          </span>
        ) : isOwned && item.category === "PASS" ? (
          <span className="text-sm font-semibold text-emerald-300">
            {ownershipStatus === "active_temporary" ? "Passe ativo" : "Passe expirado"}
          </span>
        ) : isOwned && isEquippable ? (
          equipped ? (
            <Button variant="outline" disabled className="min-h-9">
              Equipado
            </Button>
          ) : inventoryId ? (
            <form action={equip}>
              <input type="hidden" name="inventoryId" value={inventoryId} />
              <Button type="submit" disabled={equipping} className="min-h-9">
                {equipping ? "Equipando..." : "Equipar"}
              </Button>
            </form>
          ) : null
        ) : canBuy ? (
          item.isPremiumOnly && !isPremium ? (
            <span className="text-xs text-slate-500">Assine o Premium</span>
          ) : (
            <form action={purchase}>
              <input type="hidden" name="storeItemId" value={item.id} />
              <Button type="submit" disabled={purchasing || !canAfford} className="min-h-9">
                {purchasing
                  ? "Comprando..."
                  : ownershipStatus === "active_temporary" && !item.isPermanent
                    ? "Renovar"
                    : ownershipStatus === "expired_temporary"
                      ? "Renovar"
                      : "Comprar"}
              </Button>
            </form>
          )
        ) : (
          <span className="text-sm font-semibold text-emerald-300">Adquirido</span>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
      {canBuy && !item.isPremiumOnly && !canAfford && (
        <p className="mt-2 text-xs text-amber-300">Moedas insuficientes.</p>
      )}
    </Card>
  );
}
