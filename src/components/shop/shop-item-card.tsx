"use client";

import { useActionState } from "react";
import { Coins, Crown, Sparkles } from "lucide-react";
import {
  equipItemAction,
  purchaseItemAction,
  type ShopActionResult,
} from "@/app/actions/shop";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RARITY_LABELS } from "@/lib/cosmetics";
import { STORE_CATEGORY_LABELS } from "@/lib/shop-catalog";
import type { StoreItemCategory } from "@prisma/client";

type ShopItem = {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: StoreItemCategory;
  isPremiumOnly: boolean;
  metadata?: { borderId?: string; rarity?: string; themeId?: string; multiplier?: number } | null;
};

type Props = {
  item: ShopItem;
  owned: boolean;
  equipped: boolean;
  inventoryId?: string;
  userCoins: number;
  isPremium: boolean;
};

const initial: ShopActionResult = { success: false };

function categoryIcon(category: StoreItemCategory) {
  if (category === "BOOSTER") return Sparkles;
  if (category === "TITLE") return Crown;
  return Coins;
}

export function ShopItemCard({
  item,
  owned,
  equipped,
  inventoryId,
  userCoins,
  isPremium,
}: Props) {
  const [purchaseState, purchase, purchasing] = useActionState(purchaseItemAction, initial);
  const [equipState, equip, equipping] = useActionState(equipItemAction, initial);

  const Icon = categoryIcon(item.category);
  const rarity = item.metadata?.rarity as keyof typeof RARITY_LABELS | undefined;
  const isFreePremium = item.isPremiumOnly && isPremium;
  const canAfford = isFreePremium || item.cost <= userCoins;
  const error = purchaseState.error || equipState.error;

  return (
    <Card className="flex h-full flex-col border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10 text-amber-200">
          <Icon className="h-5 w-5" />
        </div>
        <Badge variant={item.isPremiumOnly ? "violet" : "default"}>
          {STORE_CATEGORY_LABELS[item.category]}
        </Badge>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-bold text-white">{item.name}</h3>
        {rarity && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-300">
            {RARITY_LABELS[rarity] ?? rarity}
          </span>
        )}
        {item.category === "BOOSTER" && item.metadata?.multiplier && (
          <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-200">
            {item.metadata.multiplier}x moedas + XP
          </span>
        )}
      </div>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{item.description}</p>

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

        {owned ? (
          item.category === "BOOSTER" ? (
            <span className="text-sm font-semibold text-emerald-300">Ativo no inventário</span>
          ) : equipped ? (
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
        ) : item.isPremiumOnly && !isPremium ? (
          <span className="text-xs text-slate-500">Assine o Premium</span>
        ) : (
          <form action={purchase}>
            <input type="hidden" name="storeItemId" value={item.id} />
            <Button type="submit" disabled={purchasing || !canAfford} className="min-h-9">
              {purchasing ? "Comprando..." : "Comprar"}
            </Button>
          </form>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
      {!owned && !item.isPremiumOnly && !canAfford && (
        <p className="mt-2 text-xs text-amber-300">Moedas insuficientes.</p>
      )}
    </Card>
  );
}
