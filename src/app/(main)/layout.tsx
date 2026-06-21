import { ImpersonationBanner } from "@/components/layout/impersonation-banner";
import { PageTransition } from "@/components/ui/page-transition";
import { cn } from "@/lib/cn";
import { getLayoutSessionAndCosmetics } from "@/lib/layout-cosmetics";
import { isAdmin } from "@/lib/permissions";
import { getMaintenanceMode } from "@/services/platform-settings.service";
import { redirect } from "next/navigation";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const { session } = await getLayoutSessionAndCosmetics();

  const maintenance = await getMaintenanceMode();
  if (maintenance.enabled && !isAdmin(session?.user?.roles)) {
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
      {session?.user?.isImpersonating ? (
        <ImpersonationBanner
          username={session.user.username}
          impersonatorUsername={session.user.impersonatorUsername}
        />
      ) : null}
      <div className={cn("w-full min-w-0", session?.user?.isImpersonating ? "pt-10" : undefined)}>
        <PageTransition>{children}</PageTransition>
      </div>
    </>
  );
}
