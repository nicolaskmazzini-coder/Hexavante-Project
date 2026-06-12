import { redirect } from "next/navigation";
import { Store } from "lucide-react";
import { auth } from "@/auth";
import { ShopTabs } from "@/components/shop/shop-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { getShopState } from "@/services/shop.service";

export default async function ShopPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/shop");

  const state = await getShopState(session.user.id);

  return (
    <PageShell>
      <PageHeader
        badge="Economia"
        icon={Store}
        title="Loja Hexavante"
        description="Gaste moedas conquistadas nos simulados em títulos, cosméticos e boosters. Assinantes Premium têm benefícios exclusivos."
      />

      <ShopTabs
        items={state.items}
        inventory={state.inventory}
        coins={state.coins}
        premium={state.premium}
        coinMultiplier={state.coinMultiplier}
        activeBooster={state.activeBooster}
      />
    </PageShell>
  );
}
