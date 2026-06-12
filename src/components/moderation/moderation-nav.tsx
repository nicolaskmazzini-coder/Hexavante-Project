"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const tabs = [
  { href: "/moderacao", label: "Visão Geral", exact: true },
  { href: "/moderacao/usuarios", label: "Usuários" },
  { href: "/moderacao/conteudo", label: "Conteúdo" },
  { href: "/moderacao/logs", label: "Logs" },
  { href: "/moderacao/terminal", label: "Terminal" },
  { href: "/moderacao/configuracoes", label: "Configurações" },
];

export function ModerationNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
      {tabs.map((tab) => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition",
              active
                ? "bg-sky-500/20 text-sky-200"
                : "text-slate-400 hover:bg-white/[0.06] hover:text-white",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
