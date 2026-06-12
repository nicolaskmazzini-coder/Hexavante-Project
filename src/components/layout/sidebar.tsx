"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BarChart3,
  BookOpen,
  Compass,
  GraduationCap,
  Hexagon,
  History,
  Map,
  Radio,
  Shield,
  ShoppingBag,
  Target,
  Users,
  Video,
  X,
} from "lucide-react";
import { canModerate, isInstructor } from "@/lib/permissions";
import type { NavSession } from "@/lib/nav-session";
import { SidebarDivider, SidebarItem } from "./sidebar-item";
import { useSidebar } from "./sidebar-context";

type Props = {
  session: NavSession;
};

const SIDEBAR_WIDTH = 260;

export function Sidebar({ session }: Props) {
  const { isOpen, close } = useSidebar();
  const pathname = usePathname();
  const panelRef = useRef<HTMLElement>(null);
  const skipPathnameCloseRef = useRef(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const roles = session?.user.roles;

  useEffect(() => {
    if (skipPathnameCloseRef.current) {
      skipPathnameCloseRef.current = false;
      return;
    }
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close]);

  if (!mounted || !isOpen) return null;

  const drawer = (
    <div className="hx-nav-sidebar-root" role="presentation">
      <button
        type="button"
        className="hx-nav-sidebar-backdrop"
        onClick={close}
        aria-label="Fechar menu de navegação"
      />

      <aside
        ref={panelRef}
        id="hx-nav-sidebar-panel"
        className="hx-nav-sidebar-panel"
        style={{
          width: SIDEBAR_WIDTH,
          minWidth: SIDEBAR_WIDTH,
          maxWidth: SIDEBAR_WIDTH,
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-[#1e1e2e] p-4">
            <Link href="/" className="flex min-w-0 items-center gap-2" onClick={close}>
              <span className="hx-icon-box shadow-lg shadow-sky-950/30">
                <Hexagon size={20} strokeWidth={2} className="shrink-0" aria-hidden />
              </span>
              <span className="truncate text-sm font-extrabold tracking-tight text-white">
                HEXAVANTE
              </span>
            </Link>
            <button
              type="button"
              onClick={close}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              aria-label="Fechar menu"
            >
              <X size={20} strokeWidth={2} aria-hidden />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-4">
            <SidebarItem href="/social" label="Social" icon={Users} />
            <SidebarItem href="/courses" label="Cursos" icon={BookOpen} />
            <SidebarItem href="/simulados" label="Simulados" icon={Target} />
            {session && (
              <SidebarItem href="/shop" label="Loja" icon={ShoppingBag} accent="amber" />
            )}
            <SidebarItem href="/" label="Introdução" icon={Compass} />
            <SidebarItem href="/courses" label="Trilha" icon={Map} />

            <SidebarDivider />

            {session && (
              <SidebarItem href="/live-rooms" label="Ao vivo" icon={Radio} accent="teal" />
            )}
            {session && (
              <SidebarItem href="/live-rooms" label="Comunidade" icon={Users} />
            )}
            <SidebarItem href="/ranking" label="Ranking" icon={BarChart3} />
            {session && (
              <SidebarItem href="/certificados" label="Certificados" icon={Award} />
            )}
            {session && (
              <SidebarItem href="/simulados/historico" label="Histórico de simulados" icon={History} />
            )}

            {session && (
              <>
                <SidebarDivider />
                <SidebarItem
                  href="/instructor/courses"
                  label={isInstructor(roles) ? "Meus cursos" : "Instrutor"}
                  icon={GraduationCap}
                />
                {isInstructor(roles) && (
                  <SidebarItem href="/instructor/live-rooms" label="Minhas salas" icon={Video} />
                )}
                {canModerate(roles) && (
                  <SidebarItem href="/moderacao" label="Moderação" icon={Shield} />
                )}
              </>
            )}
          </nav>

          {session ? (
            <div className="border-t border-white/10 px-4 py-4">
              <Link
                href={`/perfil/${session.user.username}`}
                onClick={close}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                <span className="font-semibold text-white">@{session.user.username}</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2 border-t border-white/10 px-4 py-4">
              <Link href="/login" onClick={close} className="hx-btn-secondary w-full">
                Entrar
              </Link>
              <Link href="/register" onClick={close} className="hx-btn-primary w-full">
                Cadastrar
              </Link>
            </div>
          )}
        </div>
      </aside>
    </div>
  );

  return createPortal(drawer, document.body);
}
