"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Crown,
  Package,
  Palette,
  Rocket,
  Sparkles,
  Tag,
  Ticket,
  Zap,
} from "lucide-react";
import { equipItemAction, type ShopActionResult } from "@/app/actions/shop";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STORE_CATEGORY_LABELS } from "@/lib/shop-catalog";
import { formatExpirationDate, isInventoryEntryActive } from "@/lib/shop-item-utils";
import type { StoreItem, StoreItemCategory, UserInventory } from "@prisma/client";

type InventoryEntry = UserInventory & { storeItem: StoreItem };

type Props = {
  inventory: InventoryEntry[];
  activeBooster?: boolean;
};

const EQUIPPABLE: StoreItemCategory[] = [
  "TITLE",
  "AVATAR_BORDER",
  "THEME",
  "COSMETIC",
  "PET",
  "PET_COSMETIC",
];

const CATEGORY_ICONS: Record<StoreItemCategory, typeof Sparkles> = {
  TITLE: Tag,
  AVATAR_BORDER: Crown,
  THEME: Palette,
  COSMETIC: Sparkles,
  BOOSTER: Zap,
  PASS: Ticket,
  REVIEW_PACK: BookOpen,
  PET: Sparkles,
  PET_COSMETIC: Sparkles,
};

const SECTION_ORDER: { key: StoreItemCategory; label: string }[] = [
  { key: "THEME", label: "Temas" },
  { key: "AVATAR_BORDER", label: "Molduras de avatar" },
  { key: "TITLE", label: "Títulos" },
  { key: "COSMETIC", label: "Ícones e cosméticos" },
  { key: "PET", label: "Pets" },
  { key: "PET_COSMETIC", label: "Acessórios de pet" },
  { key: "BOOSTER", label: "Boosters" },
  { key: "PASS", label: "Passes" },
  { key: "REVIEW_PACK", label: "Pacotes de revisão" },
];

const initial: ShopActionResult = { success: false };

function isActive(entry: InventoryEntry): boolean {
  return isInventoryEntryActive(entry.expiresAt);
}

function EquipRow({ item }: { item: InventoryEntry }) {
  const [state, action, pending] = useActionState(equipItemAction, initial);
  const Icon = CATEGORY_ICONS[item.storeItem.category] ?? Sparkles;
  const expired = !isActive(item);

  return (
    <InventoryCard
      item={item}
      icon={Icon}
      action={
        item.isEquipped ? (
          <Button variant="outline" disabled className="min-h-11 w-full sm:w-auto">
            Em uso
          </Button>
        ) : expired ? (
          <Link href="/shop">
            <Button variant="outline" className="min-h-11 w-full sm:w-auto">
              Renovar na loja
            </Button>
          </Link>
        ) : (
          <form action={action}>
            <input type="hidden" name="inventoryId" value={item.id} />
            <Button type="submit" disabled={pending} className="min-h-11 w-full sm:w-auto">
              {pending ? "Equipando..." : "Equipar"}
            </Button>
          </form>
        )
      }
      footer={
        <>
          {state.error && <p className="mt-2 text-xs text-red-300">{state.error}</p>}
          {state.success && <p className="mt-2 text-xs text-emerald-300">Equipado com sucesso!</p>}
        </>
      }
    />
  );
}

function BoosterRow({ item, globalActive }: { item: InventoryEntry; globalActive: boolean }) {
  const Icon = Zap;
  const active = isActive(item);
  const meta = item.storeItem.metadata as { affects?: string[]; multiplier?: number } | null;

  return (
    <InventoryCard
      item={item}
      icon={Icon}
      badges={
        active && globalActive ? (
          <Badge variant="emerald">Ativo agora</Badge>
        ) : active ? (
          <Badge variant="default">No inventário</Badge>
        ) : (
          <Badge variant="default">Expirado</Badge>
        )
      }
      extra={
        meta?.multiplier ? (
          <p className="mt-1 text-xs text-sky-200">
            Multiplicador {meta.multiplier}x
            {meta.affects?.length ? ` · ${meta.affects.join(", ").toUpperCase()}` : ""}
          </p>
        ) : null
      }
      action={
        active ? (
          <Button variant="outline" disabled className="min-h-11 w-full sm:w-auto">
            Em vigor
          </Button>
        ) : (
          <Link href="/shop">
            <Button className="min-h-11 w-full sm:w-auto">Comprar de novo</Button>
          </Link>
        )
      }
    />
  );
}

function PassRow({ item }: { item: InventoryEntry }) {
  const Icon = Ticket;
  const active = isActive(item);
  const meta = item.storeItem.metadata as {
    passType?: "premium_exams" | "early_exam";
    examSlug?: string;
  } | null;

  const href =
    meta?.passType === "early_exam" && meta.examSlug
      ? `/simulados/${meta.examSlug}`
      : "/simulados";

  const actionLabel =
    meta?.passType === "early_exam" ? "Ir ao simulado" : "Ver simulados";

  return (
    <InventoryCard
      item={item}
      icon={Icon}
      badges={active ? <Badge variant="emerald">Válido</Badge> : <Badge variant="default">Expirado</Badge>}
      action={
        active ? (
          <Link href={href}>
            <Button className="min-h-11 w-full sm:w-auto">{actionLabel}</Button>
          </Link>
        ) : (
          <Link href="/shop">
            <Button variant="outline" className="min-h-11 w-full sm:w-auto">
              Renovar na loja
            </Button>
          </Link>
        )
      }
    />
  );
}

function ReviewPackRow({ item }: { item: InventoryEntry }) {
  const Icon = BookOpen;
  const active = isActive(item);
  const meta = item.storeItem.metadata as { topic?: string; questionCount?: number } | null;

  return (
    <InventoryCard
      item={item}
      icon={Icon}
      badges={active ? <Badge variant="emerald">Acesso liberado</Badge> : <Badge variant="default">Expirado</Badge>}
      extra={
        meta?.questionCount ? (
          <p className="mt-1 text-xs text-violet-200">
            {meta.questionCount} questões{meta.topic ? ` · ${meta.topic}` : ""}
          </p>
        ) : null
      }
      action={
        active ? (
          <Link href={`/pacotes-revisao/${item.storeItem.slug}`}>
            <Button className="min-h-11 w-full sm:w-auto">Abrir pacote</Button>
          </Link>
        ) : (
          <Link href="/shop">
            <Button variant="outline" className="min-h-11 w-full sm:w-auto">
              Renovar na loja
            </Button>
          </Link>
        )
      }
    />
  );
}

function InventoryCard({
  item,
  icon: Icon,
  badges,
  extra,
  action,
  footer,
}: {
  item: InventoryEntry;
  icon: typeof Sparkles;
  badges?: ReactNode;
  extra?: ReactNode;
  action: ReactNode;
  footer?: ReactNode;
}) {
  const active = isActive(item);

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
        item.isEquipped || (active && item.storeItem.category === "BOOSTER")
          ? "border-emerald-400/30 bg-emerald-400/5"
          : active
            ? "border-white/10 bg-white/[0.03]"
            : "border-white/5 bg-white/[0.02] opacity-80"
      }`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-300">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-white">{item.storeItem.name}</p>
            <Badge variant="default">{STORE_CATEGORY_LABELS[item.storeItem.category]}</Badge>
            {item.isEquipped && EQUIPPABLE.includes(item.storeItem.category) && (
              <Badge variant="emerald">Equipado</Badge>
            )}
            {badges}
          </div>
          <p className="mt-1 text-sm text-slate-400">{item.storeItem.description}</p>
          {item.expiresAt && (
            <p className={`mt-1 text-xs ${active ? "text-violet-200" : "text-amber-300"}`}>
              {active ? "Válido até" : "Expirou em"} {formatExpirationDate(item.expiresAt)}
            </p>
          )}
          {extra}
        </div>
      </div>

      <div className="shrink-0">
        {action}
        {footer}
      </div>
    </div>
  );
}

function CategorySection({
  label,
  items,
  activeBooster,
}: {
  label: string;
  items: InventoryEntry[];
  activeBooster: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">{label}</h2>
      <div className="space-y-3">
        {items.map((item) => {
          const category = item.storeItem.category;
          if (EQUIPPABLE.includes(category)) {
            return <EquipRow key={item.id} item={item} />;
          }
          if (category === "BOOSTER") {
            return <BoosterRow key={item.id} item={item} globalActive={activeBooster} />;
          }
          if (category === "PASS") {
            return <PassRow key={item.id} item={item} />;
          }
          if (category === "REVIEW_PACK") {
            return <ReviewPackRow key={item.id} item={item} />;
          }
          return null;
        })}
      </div>
    </section>
  );
}

export function InventoryPanel({ inventory, activeBooster = false }: Props) {
  const activeCount = inventory.filter(isActive).length;

  if (inventory.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
        <Package className="mx-auto h-10 w-10 text-slate-500" />
        <p className="mt-4 font-semibold text-slate-200">Seu inventário está vazio</p>
        <p className="mt-2 text-sm text-slate-500">
          Compre cosméticos, boosters, passes e pacotes de revisão na loja.
        </p>
        <Link href="/shop" className="mt-6 inline-block">
          <Button className="min-h-11">Ir à loja</Button>
        </Link>
      </div>
    );
  }

  const grouped = Object.fromEntries(
    SECTION_ORDER.map(({ key }) => [key, inventory.filter((i) => i.storeItem.category === key)]),
  ) as Record<StoreItemCategory, InventoryEntry[]>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <span className="grid h-10 w-10 place-items-center rounded-lg border border-sky-400/20 bg-sky-400/10 text-sky-300">
          <Package className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white">
            {inventory.length} {inventory.length === 1 ? "item" : "itens"} no inventário
          </p>
          <p className="text-sm text-slate-400">
            {activeCount} ativos · equipe cosméticos ou use passes e pacotes de revisão
          </p>
        </div>
        {activeBooster && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
            <Rocket className="h-4 w-4 shrink-0" />
            Booster de recompensas ativo
          </div>
        )}
        <Link href="/shop">
          <Button variant="outline" className="min-h-11">
            Loja
          </Button>
        </Link>
      </div>

      {SECTION_ORDER.map(({ key, label }) => (
        <CategorySection
          key={key}
          label={label}
          items={grouped[key]}
          activeBooster={activeBooster}
        />
      ))}
    </div>
  );
}
