"use client";

import { useMemo, useState } from "react";
import { BookOpen, Crown, Gem, Palette, Sparkles, Tag, Ticket, Zap } from "lucide-react";
import { ShopItemCard } from "@/components/shop/shop-item-card";
import { PremiumPanel } from "@/components/shop/premium-panel";
import { SHOP_TAB_CATEGORIES } from "@/lib/shop-catalog";
import type { PremiumStatus } from "@/lib/premium";
import type { ShopItemView } from "@/services/shop.service";
import type { StoreItemCategory } from "@prisma/client";

type InventoryEntry = {
  id: string;
  storeItemId: string;
  isEquipped: boolean;
  expiresAt: Date | string | null;
};

type TabId = keyof typeof SHOP_TAB_CATEGORIES;

type Props = {
  items: ShopItemView[];
  inventory: InventoryEntry[];
  coins: number;
  premium: PremiumStatus | null;
  coinMultiplier: number;
  activeBooster: boolean;
};

const TABS: { id: TabId; label: string; icon: typeof Tag }[] = [
  { id: "titles", label: "Títulos", icon: Tag },
  { id: "cosmetics", label: "Cosméticos", icon: Palette },
  { id: "boosters", label: "Boosters", icon: Zap },
  { id: "passes", label: "Passes", icon: Ticket },
  { id: "review_packs", label: "Pacotes", icon: BookOpen },
  { id: "premium", label: "Premium", icon: Crown },
];

export function ShopTabs({
  items,
  inventory,
  coins,
  premium,
  coinMultiplier,
  activeBooster,
}: Props) {
  const [tab, setTab] = useState<TabId>("titles");

  const inventoryByItem = useMemo(
    () => new Map(inventory.map((entry) => [entry.storeItemId, entry])),
    [inventory],
  );

  const filteredItems = useMemo(() => {
    const categories = SHOP_TAB_CATEGORIES[tab];
    if (categories === "premium") return [];
    return items.filter((item) => categories.includes(item.category) && !item.isPremiumOnly);
  }, [items, tab]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {TABS.map((entry) => {
          const Icon = entry.icon;
          const active = tab === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => setTab(entry.id)}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "border-sky-400/40 bg-sky-400/15 text-sky-100"
                  : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20"
              }`}
            >
              <Icon className="h-4 w-4" />
              {entry.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-amber-100">
          <Gem className="h-4 w-4" />
          Saldo: {coins.toLocaleString("pt-BR")} moedas
        </span>
        {coinMultiplier > 1 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-100">
            <Sparkles className="h-4 w-4" />
            Multiplicador ativo: x{coinMultiplier}
          </span>
        )}
        {activeBooster && (
          <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-violet-100">
            Booster ativo
          </span>
        )}
      </div>

      {tab === "premium" ? (
        <div className="mt-6">
          <PremiumPanel
            premium={premium}
            premiumItems={items.filter((i) => i.isPremiumOnly)}
            inventory={inventory}
            coins={coins}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => {
            const entry = inventoryByItem.get(item.id);
            return (
              <ShopItemCard
                key={item.id}
                item={toCardItem(item)}
                ownershipStatus={item.ownershipStatus}
                equipped={entry?.isEquipped ?? item.isEquipped}
                inventoryId={entry?.id ?? item.inventoryId}
                expiresAt={entry?.expiresAt ?? item.expiresAt}
                userCoins={coins}
                isPremium={premium?.isActive ?? false}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function toCardItem(item: ShopItemView) {
  const metadata =
    item.metadata && typeof item.metadata === "object" && !Array.isArray(item.metadata)
      ? (item.metadata as Record<string, unknown>)
      : null;

  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    description: item.description,
    cost: item.cost,
    category: item.category as StoreItemCategory,
    isPremiumOnly: item.isPremiumOnly,
    isPermanent: item.isPermanent,
    metadata,
  };
}
