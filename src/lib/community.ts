import type { ActivityReactionType } from "@prisma/client";

export const COMMUNITY_TAGS = [
  "ENEM",
  "Programação",
  "Matemática",
  "Redação",
  "Dica de estudo",
  "Dúvida",
  "Motivação",
] as const;

export type CommunityTag = (typeof COMMUNITY_TAGS)[number];

export const REACTION_CONFIG: Record<
  ActivityReactionType,
  { label: string; emoji: string }
> = {
  CLAP: { label: "Aplausos", emoji: "👏" },
  FIRE: { label: "Incrível", emoji: "🔥" },
  IDEA: { label: "Boa ideia", emoji: "💡" },
};

export function parseTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((tag): tag is string => typeof tag === "string").slice(0, 3);
}

export function isCommunityTag(value: string): value is CommunityTag {
  return (COMMUNITY_TAGS as readonly string[]).includes(value);
}
