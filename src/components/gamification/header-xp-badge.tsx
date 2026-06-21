import Link from "next/link";
import { getUserXpProfile } from "@/services/xp.service";
import { XpProgressBar } from "./xp-progress-bar";

type Props = {
  userId: string;
};

export async function HeaderXpBadge({ userId }: Props) {
  let profile = null;

  try {
    profile = await getUserXpProfile(userId);
  } catch {
    profile = null;
  }

  if (!profile) {
    return (
      <Link
        href="/perfil"
        className="hidden min-h-11 items-center rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/15 md:inline-flex"
        title="Não foi possível carregar o XP"
      >
        XP indisponível
      </Link>
    );
  }

  return (
    <Link
      href="/perfil"
      className="hidden min-h-11 rounded-lg border border-sky-400/25 bg-sky-400/10 px-3 py-1.5 hover:bg-sky-400/15 md:block"
      title="Ver perfil e XP"
    >
      <XpProgressBar {...profile} compact />
    </Link>
  );
}
