import Link from "next/link";
import { Coins } from "lucide-react";
import { getUserWallet } from "@/services/wallet.service";

type Props = {
  userId: string;
};

export async function HeaderWalletBadge({ userId }: Props) {
  const wallet = await getUserWallet(userId);

  return (
    <Link
      href="/perfil"
      className="hidden items-center gap-1.5 rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-1.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/15 sm:inline-flex"
      title="Suas moedas"
    >
      <Coins className="h-4 w-4 text-amber-300" />
      {wallet.coins.toLocaleString("pt-BR")}
    </Link>
  );
}
