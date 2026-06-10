import { auth } from "@/auth";
import { canModerate } from "@/lib/permissions";
import { getModerationCounts, listModerationHistory } from "@/services/moderation.service";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { Shield } from "lucide-react";

export default async function ModerationDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/moderacao");
  if (!canModerate(session.user.roles)) redirect("/");

  const [counts, history] = await Promise.all([getModerationCounts(), listModerationHistory(12)]);

  return (
    <PageShell size="md">
      <PageHeader
        badge="Administração"
        icon={Shield}
        title="Moderação"
        description="Aprove instrutores e cursos da plataforma."
      />

      <div className="grid gap-4 sm:grid-cols-3">
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
        <Link
          href="/moderacao/simulados"
          className="hx-stat transition hover:border-sky-400/35 hover:bg-white/[0.06]"
          aria-label="Gerenciar simulados"
        >
          <p className="text-3xl font-bold text-teal-300">→</p>
          <p className="mt-1 font-medium text-white">Simulados</p>
          <p className="mt-1 text-sm text-slate-400">Criar e publicar provas</p>
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-white">Histórico de decisões</h2>
        <p className="mt-1 text-sm text-slate-400">Últimas análises de cursos e instrutores.</p>

        {history.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Nenhuma decisão registrada ainda.</p>
        ) : (
          <ul className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
            {history.map((item) => (
              <li
                key={`${item.type}-${item.id}`}
                className="border-b border-white/10 px-4 py-4 last:border-b-0"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.type === "course" ? `Curso: ${item.title}` : `Instrutor: ${item.title}`}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.moderatorName} ·{" "}
                      {item.reviewedAt.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {item.notes && (
                      <p className="mt-2 text-sm text-slate-300">
                        <span className="text-slate-500">Observação:</span> {item.notes}
                      </p>
                    )}
                  </div>
                  <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-sky-200">
                    {item.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
