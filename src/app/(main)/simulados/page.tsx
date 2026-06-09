import { auth } from "@/auth";
import { BarChart3, Search, Target } from "lucide-react";
import { ExamCard } from "@/components/exams/exam-card";
import { ExamFilters } from "@/components/exams/exam-filters";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import {
  getUserFinishedAttemptCounts,
  searchPublishedExams,
} from "@/services/exam.service";

type Props = {
  searchParams: Promise<{ tipo?: string; q?: string; sort?: string }>;
};

export default async function SimuladosPage({ searchParams }: Props) {
  const params = await searchParams;
  const sort = params.sort === "popular" ? "popular" : "recent";
  const session = await auth();

  const exams = await searchPublishedExams({
    examType: params.tipo,
    q: params.q,
    sort,
  });

  const attemptCounts = session?.user?.id
    ? await getUserFinishedAttemptCounts(session.user.id)
    : {};

  return (
    <PageShell>
      <PageHeader
        badge="Prática"
        icon={Target}
        title="Simulados"
        description="Resolva questões objetivas e acompanhe sua evolução por tentativa."
        action={
          <LinkButton href="/simulados/historico" variant="outline" aria-label="Ver histórico de simulados">
            <BarChart3 className="h-4 w-4 text-teal-300" />
            Histórico
          </LinkButton>
        }
      />

      <ExamFilters
        current={{
          tipo: params.tipo,
          q: params.q,
          sort,
        }}
      />

      <Card padding="sm" className="mb-6 text-sm text-slate-300">
        <span className="font-semibold text-white">{exams.length}</span> simulados encontrados
      </Card>

      {exams.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhum simulado encontrado."
          description="Tente outros termos de busca ou remova alguns filtros."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <ExamCard
              key={exam.id}
              slug={exam.slug}
              title={exam.title}
              description={exam.description}
              examType={exam.examType}
              questionCount={exam._count.questions}
              timeLimit={exam.timeLimit}
              userAttemptCount={attemptCounts[exam.id]}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
