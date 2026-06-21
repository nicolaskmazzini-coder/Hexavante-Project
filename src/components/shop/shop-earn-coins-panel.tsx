"use client";

import { Coins } from "lucide-react";
import { SHOP_EARN_COINS_HINTS } from "@/lib/shop-catalog";

export function ShopEarnCoinsPanel() {
  return (
    <section className="rounded-xl border border-[#1e1e2e] bg-[#111120] p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
        <Coins className="h-4 w-4 text-amber-300" />
        Como ganhar moedas
      </div>
      <ul className="mt-3 space-y-2">
        {SHOP_EARN_COINS_HINTS.map((hint) => (
          <li key={hint.label} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-slate-400">{hint.label}</span>
            <span className="shrink-0 font-semibold text-amber-200">
              {typeof hint.amount === "number" ? `+${hint.amount}` : hint.amount}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
