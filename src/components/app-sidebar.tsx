"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BarChart2,
  BookOpen,
  Compass,
  Globe,
  GraduationCap,
  Hexagon,
  History,
  Map,
  MessageCircle,
  Radio,
  Shield,
  ShoppingBag,
  Package,
  Target,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import { canModerate, isInstructor } from "@/lib/permissions";
import type { NavSession } from "@/lib/nav-session";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

type NavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  requiresAuth?: boolean;
  requiresInstructor?: boolean;
  requiresModerator?: boolean;
};

const PRIMARY_ITEMS: NavItem[] = [
  { icon: BookOpen, label: "Cursos", href: "/courses" },
  { icon: Target, label: "Simulados", href: "/simulados" },
  { icon: ShoppingBag, label: "Loja", href: "/shop", requiresAuth: true },
  { icon: Package, label: "Inventário", href: "/inventario", requiresAuth: true },
  { icon: Compass, label: "Introdução", href: "/" },
  { icon: Map, label: "Trilha", href: "/courses" },
];

const COMMUNITY_ITEMS: NavItem[] = [
  { icon: Radio, label: "Ao vivo", href: "/live-rooms", requiresAuth: true },
  { icon: Users, label: "Comunidade", href: "/social", requiresAuth: true },
  { icon: MessageCircle, label: "Mensagens", href: "/mensagens", requiresAuth: true },
  { icon: BarChart2, label: "Ranking", href: "/ranking" },
  { icon: Award, label: "Certificados", href: "/certificados", requiresAuth: true },
  {
    icon: History,
    label: "Histórico de simulados",
    href: "/simulados/historico",
    requiresAuth: true,
  },
];

const ACCOUNT_ITEMS: NavItem[] = [
  { icon: GraduationCap, label: "Meus cursos", href: "/instructor/courses", requiresAuth: true },
  { icon: Video, label: "Minhas salas", href: "/instructor/live-rooms", requiresInstructor: true },
  { icon: Shield, label: "Moderação", href: "/moderacao", requiresModerator: true },
  { icon: Globe, label: "Social", href: "/social" },
];

type Props = {
  session: NavSession;
};

function isItemVisible(item: NavItem, session: NavSession): boolean {
  if (item.requiresModerator && !canModerate(session?.user.roles)) return false;
  if (item.requiresInstructor && !isInstructor(session?.user.roles)) return false;
  return true;
}

function resolveNavHref(item: NavItem, session: NavSession): string {
  if (item.requiresAuth && !session) {
    return `/login?callbackUrl=${encodeURIComponent(item.href)}`;
  }
  return item.href;
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavGroup({
  items,
  session,
  pathname,
}: {
  items: NavItem[];
  session: NavSession;
  pathname: string;
}) {
  const visible = items.filter((item) => isItemVisible(item, session));
  if (!visible.length) return null;

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {visible.map((item) => {
            const href = resolveNavHref(item, session);
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(pathname, item.href)}
                  tooltip={item.label}
                >
                  <Link href={href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar({ session }: Props) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  const roles = session?.user.roles;

  const accountItems = useMemo(() => {
    return ACCOUNT_ITEMS.filter((item) => isItemVisible(item, session)).map((item) => {
      if (item.label === "Meus cursos" && (!session || !isInstructor(roles))) {
        return { ...item, label: "Instrutor", href: "/instructor/apply" };
      }
      return item;
    });
  }, [session, roles]);

  return (
    <Sidebar collapsible="offcanvas" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="hx-icon-box shadow-lg shadow-sky-950/30">
            <Hexagon className="h-5 w-5" />
          </span>
          <span className="text-sm font-extrabold tracking-tight text-sidebar-foreground">
            HEXAVANTE
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup items={PRIMARY_ITEMS} session={session} pathname={pathname} />
        <SidebarSeparator />
        <NavGroup items={COMMUNITY_ITEMS} session={session} pathname={pathname} />
        <SidebarSeparator />
        <NavGroup items={accountItems} session={session} pathname={pathname} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {session ? (
          <Link
            href={`/perfil/${session.user.username}`}
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <span className="font-semibold">@{session.user.username}</span>
          </Link>
        ) : (
          <div className="flex flex-col gap-2">
            <Link href="/login" className="hx-btn-secondary w-full text-center text-sm">
              Entrar
            </Link>
            <Link href="/register" className="hx-btn-primary w-full text-center text-sm">
              Cadastrar
            </Link>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
