"use client";

import { Menu, X } from "lucide-react";
import { useSidebar } from "./sidebar-context";

export function SidebarToggle() {
  const { isOpen, toggle } = useSidebar();

  return (
    <button
      type="button"
      id="hx-sidebar-toggle"
      onClick={toggle}
      className="hx-sidebar-toggle grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 text-slate-200 transition hover:border-sky-400/30 hover:bg-sky-400/10 hover:text-white"
      aria-label={isOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
      aria-controls="hx-nav-sidebar-panel"
      aria-expanded={isOpen}
    >
      {isOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
    </button>
  );
}
