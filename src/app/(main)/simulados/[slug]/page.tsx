import { auth } from "@/auth";
import { startExamAction } from "@/app/actions/exam";
import { AppLink } from "@/components/ui/app-link";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";
import { EXAM_PASS_SCORE } from "@/lib/gamification";
import { EXAM_TYPE_LABELS } from "@/lib/validations/exam";
import { getExamBySlug, getUserExamPerformance } from "@/services/exam.service";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BarChart3, Clock3, ClipboardList, Trophy } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export default async function ExamDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  const exam = await getExamBySlug(slug);

  if (!exam || !exam.isPublished) notFound();

  const performance = session?.user?.id
    ? await getUserExamPerformance(session.user.id, exam.id)
    : null;

  return (
    <PageShell size="md">
      <AppLink href="/simulados" muted className="mb-4 inline-flex items-center gap-1">
        ← Simulados
      </AppLink>

      <Badge variant="teal" className="mb-4">
        {EXAM_TYPE_LABELS[exam.examType] ?? exam.examType}
      </Badge>
      <h1 className="hx-page-title">{exam.title}</h1>

      {exam.description && <p className="mt-4 text-slate-300">{exam.description}</p>}

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
        <span className="flex items-center gap-1.5">
          <ClipboardList className="h-4 w-4 text-teal-300" />
          {exam._count.questions} questões
        </span>
        {exam.timeLimit && (
          <span className="flex items-center gap-1.5">
            <Clock3 className="h-4 w-4 text-sky-300" />
            {exam.timeLimit} minutos
          </span>
        )}
      </div>

      {performance && performance.attemptCount > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card padding="sm">
            <p className="text-sm text-slate-400">Suas tentativas</p>
            <p className="text-2xl font-bold text-white">{performance.attemptCount}</p>
          </Card>
          <Card padding="sm">
            <p className="text-sm text-slate-400">Média pessoal</p>
            <p className="text-2xl font-bold text-white">{performance.averageScore}%</p>
          </Card>
          <Card padding="sm">
            <p className="flex items-center gap-1.5 text-sm text-slate-400">
              <Trophy className="h-4 w-4 text-amber-300" />
              Melhor nota
            </p>
            <p
              className={`text-2xl font-bold ${
                performance.bestScore >= EXAM_PASS_SCORE ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {Math.round(performance.bestScore)}%
            </p>
          </Card>
        </div>
      )}

      {performance && performance.recentAttempts.length > 0 && (
        <Card padding="md" className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-teal-300" />
            <h2 className="font-semibold text-white">Histórico rápido</h2>
          </div>
          <ul className="space-y-2">
            {performance.recentAttempts.map((attempt) => (
              <li key={attempt.id}>
                <Link
                  href={`/simulados/${slug}/resultado/${attempt.id}`}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-sm hover:border-sky-400/30"
                >
                  <span className="text-slate-300">
                    {attempt.finishedAt?.toLocaleDateString("pt-BR")}
                  </span>
                  <span
                    className={`font-semibold ${
                      attempt.score >= EXAM_PASS_SCORE ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {Math.round(attempt.score)}%
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="mt-8">
        {session?.user ? (
          <form action={startExamAction.bind(null, exam.id, slug)}>
            <Button type="submit" size="lg">
              {performance?.attemptCount ? "Fazer nova tentativa" : "Iniciar simulado"}
            </Button>
          </form>
        ) : (
          <LinkButton
            href={`/login?callbackUrl=/simulados/${slug}`}
            size="lg"
            aria-label="Entrar para iniciar simulado"
          >
            Entrar para iniciar
          </LinkButton>
        )}
      </div>
    </PageShell>
  );
}
