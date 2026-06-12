"use client";

import { useState } from "react";
import { activatePremiumTrialAction } from "@/app/actions/premium";
import { ShopItemCard } from "@/components/shop/shop-item-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PremiumStatus } from "@/lib/premium";
import { BarChart3, Ban, Coins, Crown, Sparkles } from "lucide-react";
import type { StoreItemCategory } from "@prisma/client";

type ShopItem = {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: StoreItemCategory;
  isPremiumOnly: boolean;
};

type InventoryEntry = {
  id: string;
  storeItemId: string;
  isEquipped: boolean;
};

type Props = {
  premium: PremiumStatus | null;
  premiumItems: ShopItem[];
  inventory: InventoryEntry[];
  coins: number;
};

const BENEFITS = [
  { icon: Sparkles, text: "Simulados exclusivos e estatísticas avançadas de desempenho" },
  { icon: Ban, text: "Experiência sem anúncios (simulado no app)" },
  { icon: Coins, text: "Multiplicador permanente x2 nas moedas por questão correta" },
  { icon: Crown, text: "Itens cosméticos exclusivos gratuitos na loja" },
  { icon: BarChart3, text: "Acesso a simulados marcados como Premium" },
];

export function PremiumPanel({ premium, premiumItems, inventory, coins }: Props) {
  const inventoryByItem = new Map(inventory.map((entry) => [entry.storeItemId, entry]));
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleActivate() {
    setPending(true);
    setMessage(null);
    setError(null);
    const result = await activatePremiumTrialAction();
    if (result.success) {
      setMessage("Premium ativado! A página será atualizada.");
      window.location.reload();
    } else {
      setError(result.error ?? "Erro ao ativar Premium.");
    }
    setPending(false);
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/10 via-violet-500/10 to-sky-500/10 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-fuchsia-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-fuchsia-100">
              <Crown className="h-3.5 w-3.5" />
              Hexavante Premium
            </div>
            <h2 className="mt-4 text-2xl font-black text-white">
              {premium?.isActive ? "Você é Premium" : "Desbloqueie o estudo completo"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Assinatura simulada para demonstração do TCC. Ative o trial de 30 dias sem pagamento
              real e teste todos os benefícios no ambiente de desenvolvimento.
            </p>

            <ul className="mt-5 space-y-3">
              {BENEFITS.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <li key={benefit.text} className="flex items-start gap-3 text-sm text-slate-200">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-300" />
                    {benefit.text}
                  </li>
                );
              })}
            </ul>

            {premium?.isActive && premium.expiresAt && (
              <p className="mt-5 text-sm text-fuchsia-200">
                Válido até{" "}
                {premium.expiresAt.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          {!premium?.isActive && (
            <Button type="button" onClick={handleActivate} disabled={pending} className="min-h-10 px-6">
              {pending ? "Ativando..." : "Ativar trial Premium (30 dias)"}
            </Button>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}
      </Card>

      {premiumItems.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white">Itens exclusivos Premium</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {premiumItems.map((item) => {
              const entry = inventoryByItem.get(item.id);
              return (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  owned={Boolean(entry)}
                  equipped={entry?.isEquipped ?? false}
                  inventoryId={entry?.id}
                  userCoins={coins}
                  isPremium={premium?.isActive ?? false}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
