import { HeaderBar } from "@/components/layout/header-bar";
import { ImpersonationBanner } from "@/components/layout/impersonation-banner";
import { MainShell } from "@/components/layout/main-shell";
import { SidebarToggle } from "@/components/layout/sidebar-toggle";
import { EquippedTheme } from "@/components/shop/equipped-theme";
import { ThemeStyles } from "@/components/shop/theme-styles";
import { PageTransition } from "@/components/ui/page-transition";
import { getLayoutSessionAndCosmetics } from "@/lib/layout-cosmetics";
import { isStaff } from "@/lib/permissions";
import { toNavSession } from "@/lib/nav-session";
import { getMaintenanceMode } from "@/services/platform-settings.service";
import { redirect } from "next/navigation";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const { session, cosmetics } = await getLayoutSessionAndCosmetics();
  const navSession = toNavSession(session);

  const maintenance = await getMaintenanceMode();
  if (maintenance.enabled && !isStaff(session?.user?.roles)) {
    redirect("/manutencao");
  }

  if (session?.user?.isBanned) {
    const params = session.user.banReason
      ? `?motivo=${encodeURIComponent(session.user.banReason)}`
      : "";
    redirect(`/suspenso${params}`);
  }

  return (
    <>
      <ThemeStyles themeId={cosmetics.themeId} />
      <EquippedTheme themeId={cosmetics.themeId} themeClassName={cosmetics.themeClassName} />
      {session?.user?.isImpersonating ? (
        <ImpersonationBanner
          username={session.user.username}
          impersonatorUsername={session.user.impersonatorUsername}
        />
      ) : null}
      <MainShell session={navSession}>
        <HeaderBar session={navSession} menuToggle={<SidebarToggle />} />
        <main className={session?.user?.isImpersonating ? "pt-10" : undefined}>
          <PageTransition>{children}</PageTransition>
        </main>
      </MainShell>
    </>
  );
}
