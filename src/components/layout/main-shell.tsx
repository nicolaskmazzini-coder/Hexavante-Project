"use client";

import type { NavSession } from "@/lib/nav-session";
import { Sidebar } from "./sidebar";
import { SidebarProvider } from "./sidebar-context";

type Props = {
  session: NavSession;
  children: React.ReactNode;
};

export function MainShell({ session, children }: Props) {
  return (
    <SidebarProvider>
      <Sidebar session={session} />
      {children}
    </SidebarProvider>
  );
}
