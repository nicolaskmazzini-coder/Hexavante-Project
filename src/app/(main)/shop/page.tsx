import { redirect } from "next/navigation";
import { Store } from "lucide-react";
import { auth } from "@/auth";
import { ShopCoinHistory } from "@/components/shop/shop-coin-history";
import { ShopEarnCoinsPanel } from "@/components/shop/shop-earn-coins-panel";
import { ShopFairPlayNotice } from "@/components/shop/shop-fair-play-notice";
import { ShopProfilePreview } from "@/components/shop/shop-profile-preview";
import { ShopTabs } from "@/components/shop/shop-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { getShopState } from "@/services/shop.service";

export default async function ShopPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/shop");

  const state = await getShopState(session.user.id);

  return (
    <PageShell size="lg">
      <PageHeader
        badge="Personalização"
        icon={Store}
        title="Loja Hexavante"
        description="Personalize seu perfil com títulos, molduras, temas, pets e cosméticos — sem vantagem em provas."
      />

      <div className="mt-4">
        <ShopFairPlayNotice />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <ShopTabs
          items={state.items}
          inventory={state.inventory}
          coins={state.coins}
          premium={state.premium}
          coinMultiplier={state.coinMultiplier}
          activeBooster={state.activeBooster}
        />

        <aside className="space-y-4">
          <ShopProfilePreview
            fullName={state.profilePreview.fullName}
            username={state.profilePreview.username}
            avatarUrl={state.profilePreview.avatarUrl}
            cosmetics={state.profilePreview.cosmetics}
          />
          <ShopEarnCoinsPanel />
          <ShopCoinHistory transactions={state.coinHistory} />
        </aside>
      </div>
    </PageShell>
  );
}
