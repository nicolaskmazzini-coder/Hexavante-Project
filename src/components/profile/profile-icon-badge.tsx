import { Brain, Flame, Trophy } from "lucide-react";
import { resolveProfileIcon } from "@/lib/cosmetics";

const ICON_COMPONENTS = {
  Flame,
  Brain,
  Trophy,
} as const;

type Props = {
  iconId: string | null | undefined;
  className?: string;
  size?: "sm" | "md";
};

export function ProfileIconBadge({ iconId, className = "", size = "md" }: Props) {
  const icon = resolveProfileIcon(iconId);
  if (!icon) return null;

  const Icon = ICON_COMPONENTS[icon.lucideName as keyof typeof ICON_COMPONENTS] ?? Flame;
  const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-1.5 ${icon.className} ${className}`}
      title={icon.label}
    >
      <Icon className={sizeClass} aria-hidden />
    </span>
  );
}
