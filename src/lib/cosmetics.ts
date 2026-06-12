export type AvatarBorderRarity = "common" | "rare" | "legendary" | "premium";

export type AvatarBorderDef = {
  id: string;
  label: string;
  rarity: AvatarBorderRarity;
  description: string;
};

export type AppThemeDef = {
  id: string;
  label: string;
  description: string;
  className: string;
  vars: Record<string, string>;
};

export const AVATAR_BORDERS: Record<string, AvatarBorderDef> = {
  "border-cyan": {
    id: "border-cyan",
    label: "Borda Ciano",
    rarity: "common",
    description: "Linha sólida ciano — entrada na coleção.",
  },
  "border-aurora": {
    id: "border-aurora",
    label: "Borda Aurora",
    rarity: "rare",
    description: "Gradiente estático roxo e rosa.",
  },
  "border-gold": {
    id: "border-gold",
    label: "Borda Dourada",
    rarity: "rare",
    description: "Gradiente dourado para perfis de elite.",
  },
  "border-premium-neon": {
    id: "border-premium-neon",
    label: "Borda Neon Premium",
    rarity: "legendary",
    description: "Chroma animado exclusivo para assinantes.",
  },
};

export const APP_THEMES: Record<string, AppThemeDef> = {
  default: {
    id: "default",
    label: "Padrão Hexavante",
    description: "Visual azul e teal original.",
    className: "theme-default",
    vars: {},
  },
  cyberpunk: {
    id: "cyberpunk",
    label: "Dark Cyberpunk",
    description: "Neon fuchsia, violeta e ciano.",
    className: "theme-cyberpunk",
    vars: {
      "--color-primary": "#d946ef",
      "--color-primary-hover": "#c026d3",
      "--background": "#0a0612",
      "--foreground": "#f5f3ff",
      "--primary": "#d946ef",
      "--primary-hover": "#c026d3",
      "--accent": "#22d3ee",
      "--secondary": "#1a0f2e",
      "--border": "rgba(217, 70, 239, 0.22)",
      "--surface": "rgba(26, 15, 46, 0.82)",
      "--surface-strong": "rgba(15, 8, 28, 0.96)",
      "--cyan": "#22d3ee",
      "--cyan-glow": "rgba(34, 211, 238, 0.28)",
      "--theme-glow-1": "rgba(217, 70, 239, 0.22)",
      "--theme-glow-2": "rgba(34, 211, 238, 0.14)",
      "--theme-gradient-from": "#1a0f2e",
      "--theme-gradient-mid": "#0a0612",
      "--theme-gradient-to": "#050308",
    },
  },
  hacker: {
    id: "hacker",
    label: "Hacker / Matrix",
    description: "Terminal verde com vibe matrix.",
    className: "theme-hacker",
    vars: {
      "--color-primary": "#22c55e",
      "--color-primary-hover": "#16a34a",
      "--background": "#030a05",
      "--foreground": "#ecfdf5",
      "--primary": "#22c55e",
      "--primary-hover": "#16a34a",
      "--accent": "#84cc16",
      "--secondary": "#0a1f12",
      "--border": "rgba(34, 197, 94, 0.22)",
      "--surface": "rgba(10, 31, 18, 0.85)",
      "--surface-strong": "rgba(5, 18, 10, 0.96)",
      "--cyan": "#4ade80",
      "--cyan-glow": "rgba(74, 222, 128, 0.25)",
      "--theme-glow-1": "rgba(34, 197, 94, 0.2)",
      "--theme-glow-2": "rgba(132, 204, 22, 0.12)",
      "--theme-gradient-from": "#071a0f",
      "--theme-gradient-mid": "#030a05",
      "--theme-gradient-to": "#020503",
    },
  },
  obsidian: {
    id: "obsidian",
    label: "Obsidian Dark",
    description: "Dark extremo com acentos prata e índigo.",
    className: "theme-obsidian",
    vars: {
      "--color-primary": "#6366f1",
      "--color-primary-hover": "#4f46e5",
      "--background": "#020203",
      "--foreground": "#e2e8f0",
      "--primary": "#6366f1",
      "--primary-hover": "#4f46e5",
      "--accent": "#94a3b8",
      "--secondary": "#0c0c10",
      "--border": "rgba(148, 163, 184, 0.16)",
      "--surface": "rgba(12, 12, 16, 0.9)",
      "--surface-strong": "rgba(2, 2, 3, 0.98)",
      "--cyan": "#a5b4fc",
      "--cyan-glow": "rgba(99, 102, 241, 0.2)",
      "--theme-glow-1": "rgba(99, 102, 241, 0.12)",
      "--theme-glow-2": "rgba(148, 163, 184, 0.08)",
      "--theme-gradient-from": "#0c0c10",
      "--theme-gradient-mid": "#020203",
      "--theme-gradient-to": "#000000",
    },
  },
};

export function resolveAvatarBorder(borderId: string | null | undefined) {
  if (!borderId) return null;
  return AVATAR_BORDERS[borderId] ?? null;
}

export function getAvatarBorderClassName(borderId: string | null | undefined) {
  const border = resolveAvatarBorder(borderId);
  if (!border) return null;
  return `avatar-border avatar-border--${border.rarity} avatar-border--${border.id}`;
}

export function resolveAppTheme(themeId: string | null | undefined): AppThemeDef {
  if (!themeId || !APP_THEMES[themeId]) return APP_THEMES.default;
  return APP_THEMES[themeId];
}

export function buildThemeStyleBlock(themeId: string | null | undefined): string | null {
  const theme = resolveAppTheme(themeId);
  if (theme.id === "default" || Object.keys(theme.vars).length === 0) return null;

  const declarations = Object.entries(theme.vars)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n  ");

  return `:root {\n  ${declarations}\n}`;
}

export const RARITY_LABELS: Record<AvatarBorderRarity, string> = {
  common: "Comum",
  rare: "Rara",
  legendary: "Lendária",
  premium: "Premium",
};
