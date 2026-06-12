import { auth } from "@/auth";
import { ModerationNav } from "@/components/moderation/moderation-nav";
import { SpotlightSearch } from "@/components/moderation/spotlight-search";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { canModerate } from "@/lib/permissions";
import { Shield } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ModerationLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/moderacao");
  if (!canModerate(session.user.roles)) redirect("/");

  return (
    <PageShell size="lg">
      <PageHeader
        badge="Administração"
        icon={Shield}
        title="Moderação"
        description="Gerencie usuários, conteúdo e a plataforma."
      />
      <ModerationNav />
      <div className="mt-6">{children}</div>
      <SpotlightSearch />
      <p className="mt-8 text-center text-xs text-slate-600">
        Atalho: <kbd className="rounded border border-white/10 px-1">Ctrl+K</kbd> busca rápida
      </p>
    </PageShell>
  );
}
