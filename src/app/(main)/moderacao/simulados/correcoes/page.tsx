import { auth } from "@/auth";
import { gradeEssayAction } from "@/app/actions/exam-grading";
import { EssayGradeForm } from "@/components/exams/essay-grade-form";
import { ExamQuestionImage } from "@/components/exams/exam-question-image";
import { AppLink } from "@/components/ui/app-link";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";
import { canModerate } from "@/lib/permissions";
import { listPendingEssayAnswers } from "@/services/exam-grading.service";
import { redirect } from "next/navigation";

export default async function EssayCorrectionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/moderacao/simulados/correcoes");
  if (!canModerate(session.user.roles)) redirect("/");

  const pending = await listPendingEssayAnswers();

  return (
    <PageShell size="lg">
      <AppLink href="/moderacao/simulados" muted className="mb-4 inline-flex items-center gap-1">
        ← Simulados
      </AppLink>
      <h1 className="hx-page-title">Correção de questões dissertativas</h1>
      <p className="mt-2 text-sm text-slate-400">
        Avalie respostas abertas dos alunos. A nota final é atualizada quando todas as dissertativas
        da tentativa forem corrigidas.
      </p>

      {pending.length === 0 ? (
        <Card padding="md" className="mt-8 text-sm text-slate-400">
          Nenhuma resposta dissertativa aguardando correção.
        </Card>
      ) : (
        <div className="mt-8 space-y-6">
          {pending.map((answer) => (
            <Card key={answer.id} padding="md" className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-sky-300">{answer.attempt.exam.title}</p>
                  <p className="font-semibold text-white">
                    {answer.attempt.user.fullName} (@{answer.attempt.user.username})
                  </p>
                  <p className="text-xs text-slate-500">{answer.attempt.user.email}</p>
                </div>
                <AppLink
                  href={`/simulados/${answer.attempt.exam.slug}/resultado/${answer.attemptId}`}
                  muted
                  className="text-sm"
                >
                  Ver tentativa
                </AppLink>
              </div>

              <div>
                <p className="text-sm font-medium text-white">
                  Questão {answer.question.orderNumber}
                </p>
                <p className="mt-1 text-sm text-slate-300">{answer.question.statement}</p>
                <ExamQuestionImage
                  url={answer.question.imageUrl}
                  naturalWidth={answer.question.imageWidth}
                  naturalHeight={answer.question.imageHeight}
                  displaySize={answer.question.imageDisplaySize}
                  alt={`Imagem da questão ${answer.question.orderNumber}`}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Resposta do aluno
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">
                    {answer.essayAnswer}
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                    Gabarito de referência
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">
                    {answer.question.expectedAnswer ?? "—"}
                  </p>
                </div>
              </div>

              <EssayGradeForm answerId={answer.id} action={gradeEssayAction} />
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
