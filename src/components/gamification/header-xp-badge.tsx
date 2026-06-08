import Link from "next/link";
import { getUserXpProfile } from "@/services/xp.service";
import { XpProgressBar } from "./xp-progress-bar";

type Props = {
  userId: string;
};

export async function HeaderXpBadge({ userId }: Props) {
  const profile = await getUserXpProfile(userId);
  if (!profile) return null;

  return (
    <Link
      href="/perfil"
      className="hidden rounded-lg border border-sky-400/25 bg-sky-400/10 px-3 py-1.5 hover:bg-sky-400/15 md:block"
      title="Ver perfil e XP"
    >
      <XpProgressBar {...profile} compact />
    </Link>
  );
}
