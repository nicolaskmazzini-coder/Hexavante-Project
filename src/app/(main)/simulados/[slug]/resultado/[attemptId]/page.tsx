import { auth } from "@/auth";
import { getAttemptResult } from "@/services/exam.service";
import { getXpForSource } from "@/services/xp.service";
import { AppLink } from "@/components/ui/app-link";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";
import { EXAM_PASS_SCORE } from "@/lib/gamification";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string; attemptId: string }>;
};

export default async function ExamResultPage({ params }: Props) {
  const { slug, attemptId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/simulados/${slug}`);

  const attempt = await getAttemptResult(session.user.id, attemptId);
  if (!attempt || !attempt.finishedAt || attempt.exam.slug !== slug) notFound();

  const passed = attempt.score >= EXAM_PASS_SCORE;

  const [baseXp, passXp] = await Promise.all([
    getXpForSource(session.user.id, "EXAM", attemptId),
    getXpForSource(session.user.id, "EXAM", `${attemptId}-pass`),
  ]);
  const totalXpEarned = (baseXp?.amount ?? 0) + (passXp?.amount ?? 0);

  return (
    <PageShell size="md">
      <AppLink href="/simulados/historico" muted className="mb-4 inline-flex items-center gap-1">
        ← Meu histórico
      </AppLink>

      <Alert variant={passed ? "success" : "warning"} className="p-6">
        <h1 className="text-2xl font-bold">Resultado</h1>
        <p className="mt-1 opacity-90">{attempt.exam.title}</p>
        <p className="mt-4 text-4xl font-bold">{Math.round(attempt.score)}%</p>
        <p className="mt-2 opacity-90">
          {attempt.correctAnswers} de {attempt.totalQuestions} questões corretas
        </p>
        {totalXpEarned > 0 && (
          <p className="mt-3 text-sm font-medium text-sky-200">
            +{totalXpEarned} XP ganhos neste simulado
          </p>
        )}
      </Alert>

      <div className="mt-8 space-y-4">
        <h2 className="font-semibold text-white">Revisão com gabarito</h2>
        {attempt.answers
          .sort((a, b) => a.question.orderNumber - b.question.orderNumber)
          .map((answer) => {
            const correctAlternative = answer.question.alternatives.find((alt) => alt.isCorrect);

            return (
              <Card
                key={answer.id}
                padding="md"
                className={
                  answer.isCorrect
                    ? "border-emerald-400/30 bg-emerald-400/5"
                    : "border-red-400/30 bg-red-400/5"
                }
              >
                <p className="font-medium text-white">
                  {answer.question.orderNumber}. {answer.question.statement}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Sua resposta: {answer.alternative.text}
                </p>
                {!answer.isCorrect && correctAlternative && (
                  <p className="mt-2 text-sm font-medium text-emerald-300">
                    Gabarito: {correctAlternative.text}
                  </p>
                )}
                <p
                  className={`mt-1 text-sm font-medium ${
                    answer.isCorrect ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {answer.isCorrect ? "Correta" : "Incorreta"}
                </p>
              </Card>
            );
          })}
      </div>

      <div className="mt-8 flex gap-3">
        <LinkButton href={`/simulados/${slug}`} variant="outline" aria-label="Refazer simulado">
          Refazer simulado
        </LinkButton>
        <LinkButton href="/simulados" aria-label="Ver outros simulados">
          Ver outros simulados
        </LinkButton>
      </div>
    </PageShell>
  );
}
