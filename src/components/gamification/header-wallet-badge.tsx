import Link from "next/link";
import { Coins } from "lucide-react";
import { BoosterIndicator } from "@/components/gamification/booster-indicator";
import { getUserCoinProfile, getUserWallet } from "@/services/wallet.service";

type Props = {
  userId: string;
};

export async function HeaderWalletBadge({ userId }: Props) {
  let profile = { coins: 0, boosterMultiplier: 1, boosterExpiresAt: null as Date | null };
  let failed = false;

  try {
    profile = await getUserCoinProfile(userId);
  } catch {
    try {
      const wallet = await getUserWallet(userId);
      profile.coins = wallet.coins;
    } catch {
      failed = true;
    }
  }

  if (failed) {
    return (
      <Link
        href="/shop"
        className="hidden items-center gap-1.5 rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/15 sm:inline-flex"
        title="Não foi possível carregar o saldo"
      >
        <Coins className="h-4 w-4" />
        —
      </Link>
    );
  }

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <BoosterIndicator
        multiplier={profile.boosterMultiplier}
        expiresAt={profile.boosterExpiresAt?.toISOString() ?? null}
      />
      <Link
        href="/shop"
        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-1.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/15"
        title="Suas moedas"
      >
        <Coins className="h-4 w-4 text-amber-300" />
        {profile.coins.toLocaleString("pt-BR")}
      </Link>
    </div>
  );
}
