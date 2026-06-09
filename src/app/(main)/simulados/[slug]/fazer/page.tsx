import { auth } from "@/auth";
import { ExamForm } from "@/components/exams/exam-form";
import { AppLink } from "@/components/ui/app-link";
import { PageShell } from "@/components/ui/page-shell";
import { getExamForTaking } from "@/services/exam.service";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ attempt?: string }>;
};

export default async function TakeExamPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { attempt: attemptId } = await searchParams;
  const session = await auth();

  if (!session?.user?.id) redirect(`/login?callbackUrl=/simulados/${slug}`);

  const exam = await getExamForTaking(slug);
  if (!exam || exam.questions.length === 0) notFound();

  if (!attemptId) redirect(`/simulados/${slug}`);

  const attempt = await prisma.examAttempt.findFirst({
    where: {
      id: attemptId,
      userId: session.user.id,
      examId: exam.id,
      finishedAt: null,
    },
  });

  if (!attempt) redirect(`/simulados/${slug}`);

  return (
    <PageShell size="md">
      <AppLink href={`/simulados/${slug}`} muted className="mb-4 inline-flex items-center gap-1">
        ← Voltar ao simulado
      </AppLink>
      <h1 className="hx-page-title">{exam.title}</h1>
      <p className="mt-2 text-sm text-slate-400">
        Responda todas as questões. Use os números acima para navegar entre elas.
      </p>

      <div className="mt-8">
        <ExamForm
          slug={slug}
          attemptId={attempt.id}
          title={exam.title}
          questions={exam.questions}
          startedAt={attempt.startedAt.toISOString()}
          timeLimitMinutes={exam.timeLimit}
        />
      </div>
    </PageShell>
  );
}
