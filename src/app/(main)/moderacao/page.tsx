import { OverviewDashboard } from "@/components/moderation/overview-dashboard";
import { getPlatformModerationStats } from "@/services/moderation-admin.service";
import Link from "next/link";

export default async function ModerationDashboardPage() {
  const stats = await getPlatformModerationStats();

  return (
    <div className="space-y-8">
      <OverviewDashboard initial={stats} />

      <section>
        <h2 className="text-lg font-bold text-white">Acesso rápido</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Link
            href="/moderacao/instrutores"
            className="hx-stat transition hover:border-sky-400/35 hover:bg-white/[0.06]"
          >
            <p className="text-3xl font-bold text-sky-300">{stats.pendingApplications}</p>
            <p className="mt-1 font-medium text-white">Instrutores pendentes</p>
          </Link>
          <Link
            href="/moderacao/cursos"
            className="hx-stat transition hover:border-sky-400/35 hover:bg-white/[0.06]"
          >
            <p className="text-3xl font-bold text-sky-300">{stats.pendingCourses}</p>
            <p className="mt-1 font-medium text-white">Cursos pendentes</p>
          </Link>
          <Link
            href="/moderacao/terminal"
            className="hx-stat transition hover:border-green-400/35 hover:bg-white/[0.06]"
          >
            <p className="text-3xl font-bold text-green-400">$</p>
            <p className="mt-1 font-medium text-white">Terminal CLI</p>
            <p className="mt-1 text-sm text-slate-400">Comandos de moderação</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
