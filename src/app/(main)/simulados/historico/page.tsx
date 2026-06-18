import { auth } from "@/auth";
import { ExamEvolutionChart } from "@/components/exams/exam-evolution-chart";
import { AppLink } from "@/components/ui/app-link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { NativeSelect } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { EXAM_PASS_SCORE } from "@/lib/gamification";
import { EXAM_TYPE_LABELS } from "@/lib/validations/exam";
import {
  getUserExamEvolution,
  getUserExamStats,
  listUserAttemptsFiltered,
} from "@/services/exam.service";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";

type Props = {
  searchParams: Promise<{ tipo?: string; page?: string }>;
};

export default async function HistoricoPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/simulados/historico");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [history, stats, evolution] = await Promise.all([
    listUserAttemptsFiltered(session.user.id, {
      examType: params.tipo,
      page,
      pageSize: 10,
    }),
    getUserExamStats(session.user.id),
    getUserExamEvolution(session.user.id, 10),
  ]);

  return (
    <PageShell>
      <PageHeader
        badge="Histórico"
        icon={BarChart3}
        title="Meu histórico"
        description="Acompanhe tentativas, médias e evolução nos simulados."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card padding="sm">
          <p className="text-sm text-slate-400">Tentativas</p>
          <p className="text-2xl font-bold text-white">{stats.totalAttempts}</p>
        </Card>
        <Card padding="sm">
          <p className="text-sm text-slate-400">Média</p>
          <p className="text-2xl font-bold text-white">{stats.averageScore}%</p>
        </Card>
        <Card padding="sm">
          <p className="text-sm text-slate-400">Melhor nota</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.bestScore}%</p>
        </Card>
      </div>

      <ExamEvolutionChart data={evolution} />

      <Card padding="md" className="mt-8">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-56">
            <label htmlFor="tipo" className="mb-1.5 block text-sm font-semibold text-slate-200">
              Filtrar por tipo
            </label>
            <NativeSelect id="tipo" name="tipo" defaultValue={params.tipo ?? ""}>
              <option value="">Todos</option>
              {Object.entries(EXAM_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </NativeSelect>
          </div>
          <button
            type="submit"
            className="hx-btn-secondary min-h-10 px-4 py-2 text-sm font-semibold"
          >
            Aplicar filtro
          </button>
        </form>
      </Card>

      {history.attempts.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Nenhuma tentativa encontrada."
          description="Faça um simulado para ver seu histórico aqui."
          className="mt-8"
        >
          <AppLink href="/simulados" className="mt-4 inline-block">
            Ver simulados
          </AppLink>
        </EmptyState>
      ) : (
        <>
          <ul className="mt-6 space-y-3">
            {history.attempts.map((attempt) => (
              <li key={attempt.id}>
                <Link
                  href={`/simulados/${attempt.exam.slug}/resultado/${attempt.id}`}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-4 hover:border-sky-400/35"
                  aria-label={`Ver resultado de ${attempt.exam.title}: ${Math.round(attempt.score)}%`}
                >
                  <div>
                    <p className="font-semibold text-white">{attempt.exam.title}</p>
                    <p className="text-sm text-slate-400">
                      {EXAM_TYPE_LABELS[attempt.exam.examType]} · {attempt.correctAnswers}/
                      {attempt.totalQuestions} acertos ·{" "}
                      {attempt.finishedAt?.toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span
                    className={`text-lg font-bold ${
                      attempt.score >= EXAM_PASS_SCORE ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {Math.round(attempt.score)}%
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {history.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              {page > 1 && (
                <Link
                  href={`/simulados/historico?${new URLSearchParams({
                    ...(params.tipo ? { tipo: params.tipo } : {}),
                    page: String(page - 1),
                  }).toString()}`}
                  className="hx-btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  ← Anterior
                </Link>
              )}
              <span className="text-sm text-slate-400">
                Página {history.page} de {history.totalPages}
              </span>
              {page < history.totalPages && (
                <Link
                  href={`/simulados/historico?${new URLSearchParams({
                    ...(params.tipo ? { tipo: params.tipo } : {}),
                    page: String(page + 1),
                  }).toString()}`}
                  className="hx-btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  Próxima →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
