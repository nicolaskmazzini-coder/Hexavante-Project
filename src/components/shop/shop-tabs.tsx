"use client";

import { useMemo, useState } from "react";
import { BookOpen, Crown, Gem, Palette, Sparkles, Ticket, Zap } from "lucide-react";
import { ShopFairPlayNotice } from "@/components/shop/shop-fair-play-notice";
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

const TABS: { id: TabId; label: string; icon: typeof Palette }[] = [
  { id: "personalize", label: "Personalizar", icon: Palette },
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
  const [tab, setTab] = useState<TabId>("personalize");
  const [categoryFilter, setCategoryFilter] = useState<StoreItemCategory | "all">("all");

  const inventoryByItem = useMemo(
    () => new Map(inventory.map((entry) => [entry.storeItemId, entry])),
    [inventory],
  );

  const personalizeCategories = SHOP_TAB_CATEGORIES.personalize as StoreItemCategory[];

  const filteredItems = useMemo(() => {
    const categories = SHOP_TAB_CATEGORIES[tab];
    if (categories === "premium") return [];

    let list = items.filter((item) => categories.includes(item.category) && !item.isPremiumOnly);

    if (tab === "personalize" && categoryFilter !== "all") {
      list = list.filter((item) => item.category === categoryFilter);
    }

    return list;
  }, [categoryFilter, items, tab]);

  return (
    <div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((entry) => {
          const Icon = entry.icon;
          const active = tab === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => {
                setTab(entry.id);
                setCategoryFilter("all");
              }}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
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

      {tab === "personalize" && (
        <div className="mt-4 flex flex-wrap gap-2">
          <FilterChip
            active={categoryFilter === "all"}
            onClick={() => setCategoryFilter("all")}
            label="Todos"
          />
          {personalizeCategories.map((category) => (
            <FilterChip
              key={category}
              active={categoryFilter === category}
              onClick={() => setCategoryFilter(category)}
              label={categoryLabelShort(category)}
            />
          ))}
        </div>
      )}

      {(tab === "boosters" || tab === "passes") && (
        <div className="mt-4">
          <ShopFairPlayNotice prominent={tab === "boosters"} />
        </div>
      )}

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
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
          {filteredItems.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-white/15 bg-[#111120] p-8 text-center">
              <p className="font-semibold text-slate-200">Nenhum item nesta categoria.</p>
            </div>
          ) : (
            filteredItems.map((item) => {
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
            })
          )}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-sky-400/20 text-sky-100 ring-1 ring-sky-400/40"
          : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

function categoryLabelShort(category: StoreItemCategory): string {
  const labels: Partial<Record<StoreItemCategory, string>> = {
    TITLE: "Títulos",
    AVATAR_BORDER: "Molduras",
    THEME: "Temas",
    COSMETIC: "Ícones",
    PET: "Pets",
    PET_COSMETIC: "Acessórios",
  };
  return labels[category] ?? category;
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
