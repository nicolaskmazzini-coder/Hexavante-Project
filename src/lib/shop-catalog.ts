import type { Prisma, StoreItemCategory } from "@prisma/client";

export type ShopCatalogItem = {
  slug: string;
  name: string;
  description: string;
  cost: number;
  category: StoreItemCategory;
  imageUrl?: string;
  isPremiumOnly?: boolean;
  metadata?: Prisma.InputJsonValue;
};

export const SHOP_CATALOG: ShopCatalogItem[] = [
  {
    slug: "title-biomas",
    name: "Mestre dos Biomas",
    description: "Título exclusivo para quem domina ciências da natureza.",
    cost: 120,
    category: "TITLE",
    metadata: { titleText: "Mestre dos Biomas" },
  },
  {
    slug: "title-dev-senior",
    name: "Dev Sênior",
    description: "Mostre sua maestria em tecnologia no perfil.",
    cost: 150,
    category: "TITLE",
    metadata: { titleText: "Dev Sênior" },
  },
  {
    slug: "title-estudioso",
    name: "Estudioso Imparável",
    description: "Para quem não para de aprender.",
    cost: 100,
    category: "TITLE",
    metadata: { titleText: "Estudioso Imparável" },
  },
  {
    slug: "border-cyan",
    name: "Borda Ciano",
    description: "Linha sólida ciano — borda comum para iniciantes.",
    cost: 40,
    category: "AVATAR_BORDER",
    metadata: { borderId: "border-cyan", rarity: "common" },
  },
  {
    slug: "border-aurora",
    name: "Borda Aurora",
    description: "Gradiente estático roxo e rosa — raridade rara.",
    cost: 80,
    category: "AVATAR_BORDER",
    metadata: { borderId: "border-aurora", rarity: "rare" },
  },
  {
    slug: "border-gold",
    name: "Borda Dourada",
    description: "Gradiente dourado estático — raridade rara.",
    cost: 120,
    category: "AVATAR_BORDER",
    metadata: { borderId: "border-gold", rarity: "rare" },
  },
  {
    slug: "theme-cyberpunk",
    name: "Tema Dark Cyberpunk",
    description: "Neon fuchsia, violeta e ciano em toda a interface.",
    cost: 200,
    category: "THEME",
    metadata: { themeId: "cyberpunk" },
  },
  {
    slug: "theme-hacker",
    name: "Tema Hacker / Matrix",
    description: "Estética terminal verde para foco total.",
    cost: 180,
    category: "THEME",
    metadata: { themeId: "hacker" },
  },
  {
    slug: "theme-obsidian",
    name: "Tema Obsidian Dark",
    description: "Dark extremo com acentos prata e índigo.",
    cost: 220,
    category: "THEME",
    metadata: { themeId: "obsidian" },
  },
  {
    slug: "booster-rewards-24h",
    name: "Booster de Recompensas (24h)",
    description: "Dobra moedas e XP ganhos ao estudar por 24 horas.",
    cost: 90,
    category: "BOOSTER",
    metadata: { multiplier: 2, durationHours: 24, affects: ["coins", "xp"] },
  },
  {
    slug: "cosmetic-spark-notes",
    name: "Adesivo Spark Notes",
    description: "Cosmético decorativo para o perfil.",
    cost: 60,
    category: "COSMETIC",
    metadata: { icon: "sparkles" },
  },
  {
    slug: "title-premium-crown",
    name: "Coroa Premium",
    description: "Título exclusivo para assinantes Premium.",
    cost: 0,
    category: "TITLE",
    isPremiumOnly: true,
    metadata: { titleText: "Coroa Premium" },
  },
  {
    slug: "border-premium-neon",
    name: "Borda Neon Premium",
    description: "Chroma animado lendário — exclusivo para assinantes.",
    cost: 0,
    category: "AVATAR_BORDER",
    isPremiumOnly: true,
    metadata: { borderId: "border-premium-neon", rarity: "legendary" },
  },
];

export const STORE_CATEGORY_LABELS: Record<StoreItemCategory, string> = {
  TITLE: "Títulos",
  AVATAR_BORDER: "Bordas de avatar",
  THEME: "Temas",
  COSMETIC: "Cosméticos",
  BOOSTER: "Boosters",
};
