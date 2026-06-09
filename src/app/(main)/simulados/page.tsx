import Link from "next/link";
import { BarChart3, Search, Target } from "lucide-react";
import { ExamCard } from "@/components/exams/exam-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { EXAM_TYPE_LABELS } from "@/lib/validations/exam";
import { listPublishedExams } from "@/services/exam.service";
import { cn } from "@/lib/cn";

type Props = {
  searchParams: Promise<{ tipo?: string }>;
};

export default async function SimuladosPage({ searchParams }: Props) {
  const { tipo } = await searchParams;
  const exams = await listPublishedExams(tipo);

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

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/simulados"
          className={cn("hx-filter-pill", !tipo ? "hx-filter-pill-active" : "hx-filter-pill-inactive")}
          aria-label="Filtrar por todos os simulados"
        >
          Todos
        </Link>
        {Object.entries(EXAM_TYPE_LABELS).map(([value, label]) => (
          <Link
            key={value}
            href={`/simulados?tipo=${value}`}
            className={cn(
              "hx-filter-pill",
              tipo === value ? "hx-filter-pill-active" : "hx-filter-pill-inactive",
            )}
            aria-label={`Filtrar por ${label}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {exams.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhum simulado disponível ainda."
          description="Novas provas aparecerão aqui quando forem publicadas."
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
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
