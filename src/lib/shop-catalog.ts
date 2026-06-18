import type { Prisma, StoreItemCategory } from "@prisma/client";

export type ShopCatalogItem = {
  slug: string;
  name: string;
  description: string;
  cost: number;
  category: StoreItemCategory;
  imageUrl?: string;
  isPremiumOnly?: boolean;
  isPermanent?: boolean;
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
    slug: "border-crystal",
    name: "Moldura Cristal",
    description: "Moldura de perfil com brilho gelo — cosmético lendário.",
    cost: 160,
    category: "AVATAR_BORDER",
    metadata: { borderId: "border-crystal", rarity: "legendary" },
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
    isPermanent: false,
    metadata: { multiplier: 2, durationHours: 24, affects: ["coins", "xp"] },
  },
  {
    slug: "booster-xp-12h",
    name: "Booster de XP (12h)",
    description: "Dobra apenas o XP conquistado em simulados e cursos por 12 horas.",
    cost: 70,
    category: "BOOSTER",
    isPermanent: false,
    metadata: { multiplier: 2, durationHours: 12, affects: ["xp"] },
  },
  {
    slug: "booster-xp-48h",
    name: "Booster de XP (48h)",
    description: "Dobra o XP ganho por 48 horas — ideal para maratonas de estudo.",
    cost: 140,
    category: "BOOSTER",
    isPermanent: false,
    metadata: { multiplier: 2, durationHours: 48, affects: ["xp"] },
  },
  {
    slug: "cosmetic-spark-notes",
    name: "Adesivo Spark Notes",
    description: "Cosmético decorativo para o perfil.",
    cost: 60,
    category: "COSMETIC",
    metadata: { cosmeticType: "sticker", icon: "sparkles" },
  },
  {
    slug: "cosmetic-icon-flame",
    name: "Ícone Chama",
    description: "Ícone exclusivo de perfil para estudantes em alta performance.",
    cost: 85,
    category: "COSMETIC",
    metadata: { cosmeticType: "profile_icon", iconId: "icon-flame" },
  },
  {
    slug: "cosmetic-icon-brain",
    name: "Ícone Mente Brilhante",
    description: "Ícone de perfil que destaca seu foco intelectual.",
    cost: 95,
    category: "COSMETIC",
    metadata: { cosmeticType: "profile_icon", iconId: "icon-brain" },
  },
  {
    slug: "cosmetic-icon-trophy",
    name: "Ícone Troféu",
    description: "Mostre suas conquistas com este ícone lendário no perfil.",
    cost: 110,
    category: "COSMETIC",
    metadata: { cosmeticType: "profile_icon", iconId: "icon-trophy" },
  },
  {
    slug: "pass-premium-exams-7d",
    name: "Passe Simulados Premium (7 dias)",
    description: "Acesso antecipado a simulados exclusivos Premium por 7 dias, sem assinatura.",
    cost: 200,
    category: "PASS",
    isPermanent: false,
    metadata: { passType: "premium_exams", durationDays: 7 },
  },
  {
    slug: "pass-early-logica",
    name: "Passe Lançamento — Lógica Avançada",
    description:
      "Libera acesso antecipado ao simulado Desafio Premium — Lógica Avançada por 14 dias.",
    cost: 150,
    category: "PASS",
    isPermanent: false,
    metadata: {
      passType: "early_exam",
      examSlug: "desafio-premium-logica-avancada",
      durationDays: 14,
    },
  },
  {
    slug: "pack-revisao-logica",
    name: "Pacote Revisão — Lógica de Programação",
    description:
      "Conjunto de 10 questões selecionadas sobre lógica e algoritmos para revisão focada.",
    cost: 75,
    category: "REVIEW_PACK",
    isPermanent: false,
    metadata: {
      topic: "Lógica de Programação",
      examSlugs: ["logica-programacao-basica"],
      questionCount: 10,
      durationDays: 14,
    },
  },
  {
    slug: "pack-revisao-premium",
    name: "Pacote Revisão — Desafio Premium",
    description: "Questões selecionadas do simulado premium para treino intensivo por 7 dias.",
    cost: 100,
    category: "REVIEW_PACK",
    isPermanent: false,
    metadata: {
      topic: "Lógica Avançada",
      examSlugs: ["desafio-premium-logica-avancada"],
      questionCount: 8,
      durationDays: 7,
    },
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
  AVATAR_BORDER: "Molduras de perfil",
  THEME: "Temas",
  COSMETIC: "Cosméticos",
  BOOSTER: "Boosters",
  PASS: "Passes",
  REVIEW_PACK: "Pacotes de revisão",
};

export const SHOP_TAB_CATEGORIES: Record<
  "titles" | "cosmetics" | "boosters" | "passes" | "review_packs" | "premium",
  StoreItemCategory[] | "premium"
> = {
  titles: ["TITLE"],
  cosmetics: ["AVATAR_BORDER", "THEME", "COSMETIC"],
  boosters: ["BOOSTER"],
  passes: ["PASS"],
  review_packs: ["REVIEW_PACK"],
  premium: "premium",
};
