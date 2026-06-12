"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { useSidebar } from "./sidebar-context";

type Props = {
  href: string;
  label: string;
  icon: LucideIcon;
  accent?: "default" | "amber" | "teal";
};

const accentClasses = {
  default: "text-slate-300 hover:bg-white/[0.06] hover:text-white",
  amber: "text-amber-100 hover:bg-amber-400/10 hover:text-amber-50",
  teal: "text-teal-100 hover:bg-teal-400/10 hover:text-teal-50",
};

export function SidebarItem({ href, label, icon: Icon, accent = "default" }: Props) {
  const pathname = usePathname();
  const { close } = useSidebar();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      onClick={() => {
        close();
      }}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        isActive ? "bg-sky-400/15 text-white" : accentClasses[accent],
      )}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-300">
        <Icon size={20} strokeWidth={2} className="shrink-0" aria-hidden />
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function SidebarDivider() {
  return <div className="my-2 border-t border-white/10" role="separator" />;
}
