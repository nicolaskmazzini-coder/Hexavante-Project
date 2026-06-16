"use client";

import { usePathname } from "next/navigation";
import type { NavSession } from "@/lib/nav-session";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const BARE_LAYOUT_PREFIXES = [
  "/login",
  "/register",
  "/manutencao",
  "/suspenso",
  "/recuperar-senha",
  "/redefinir-senha",
];

type Props = {
  session: NavSession;
  children: React.ReactNode;
};

export function AppShell({ session, children }: Props) {
  const pathname = usePathname();
  const useBareLayout = BARE_LAYOUT_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (useBareLayout) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar session={session} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
