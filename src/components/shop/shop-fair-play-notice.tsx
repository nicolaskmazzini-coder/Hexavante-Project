"use client";

import { ShieldCheck } from "lucide-react";
import { SHOP_FAIR_PLAY_NOTE } from "@/lib/shop-catalog";

type Props = {
  prominent?: boolean;
};

export function ShopFairPlayNotice({ prominent = false }: Props) {
  return (
    <div
      className={
        prominent
          ? "rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-4"
          : "rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3"
      }
    >
      <div className="flex gap-3">
        <ShieldCheck
          className={`mt-0.5 shrink-0 ${prominent ? "h-5 w-5 text-emerald-300" : "h-4 w-4 text-slate-400"}`}
        />
        <div>
          <p
            className={`font-semibold ${prominent ? "text-emerald-100" : "text-sm text-slate-300"}`}
          >
            Fair play educacional
          </p>
          <p className={`mt-1 leading-6 ${prominent ? "text-sm text-emerald-100/90" : "text-xs text-slate-500"}`}>
            {SHOP_FAIR_PLAY_NOTE}
          </p>
        </div>
      </div>
    </div>
  );
}
