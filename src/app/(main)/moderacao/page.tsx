import { auth } from "@/auth";
import { canModerate } from "@/lib/permissions";
import { getModerationCounts } from "@/services/moderation.service";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { Shield } from "lucide-react";

export default async function ModerationDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/moderacao");
  if (!canModerate(session.user.roles)) redirect("/");

  const counts = await getModerationCounts();

  return (
    <PageShell size="md">
      <PageHeader
        badge="Administração"
        icon={Shield}
        title="Moderação"
        description="Aprove instrutores e cursos da plataforma."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/moderacao/instrutores"
          className="hx-stat transition hover:border-sky-400/35 hover:bg-white/[0.06]"
          aria-label="Ver solicitações de instrutor"
        >
          <p className="text-3xl font-bold text-sky-300">{counts.pendingApplications}</p>
          <p className="mt-1 font-medium text-white">Solicitações de instrutor</p>
          <p className="mt-1 text-sm text-slate-400">Pendentes de análise</p>
        </Link>
        <Link
          href="/moderacao/cursos"
          className="hx-stat transition hover:border-sky-400/35 hover:bg-white/[0.06]"
          aria-label="Ver cursos pendentes"
        >
          <p className="text-3xl font-bold text-sky-300">{counts.pendingCourses}</p>
          <p className="mt-1 font-medium text-white">Cursos pendentes</p>
          <p className="mt-1 text-sm text-slate-400">Aguardando publicação</p>
        </Link>
      </div>
    </PageShell>
  );
}
