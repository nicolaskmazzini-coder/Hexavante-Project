import Link from "next/link";
import { BarChart3, Search, Target } from "lucide-react";
import { ExamCard } from "@/components/exams/exam-card";
import { EXAM_TYPE_LABELS } from "@/lib/validations/exam";
import { listPublishedExams } from "@/services/exam.service";

type Props = {
  searchParams: Promise<{ tipo?: string }>;
};

export default async function SimuladosPage({ searchParams }: Props) {
  const { tipo } = await searchParams;
  const exams = await listPublishedExams(tipo);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 rounded-xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-400/10 px-3 py-1 text-xs font-semibold text-teal-200">
              <Target className="h-3.5 w-3.5" />
              Prática
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white">Simulados</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Resolva questões objetivas e acompanhe sua evolução por tentativa.
            </p>
          </div>
          <Link
            href="/simulados/historico"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-teal-400/35 hover:bg-teal-400/10"
            aria-label="Ver histórico de simulados"
          >
            <BarChart3 className="h-4 w-4 text-teal-300" />
            Histórico
          </Link>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/simulados"
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            !tipo
              ? "border-teal-400/30 bg-teal-400/15 text-teal-100"
              : "border-white/10 bg-white/[0.035] text-slate-300 hover:border-teal-400/30 hover:bg-teal-400/10 hover:text-white"
          }`}
          aria-label="Filtrar por todos os simulados"
        >
          Todos
        </Link>
        {Object.entries(EXAM_TYPE_LABELS).map(([value, label]) => (
          <Link
            key={value}
            href={`/simulados?tipo=${value}`}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              tipo === value
                ? "border-teal-400/30 bg-teal-400/15 text-teal-100"
                : "border-white/10 bg-white/[0.035] text-slate-300 hover:border-teal-400/30 hover:bg-teal-400/10 hover:text-white"
            }`}
            aria-label={`Filtrar por ${label}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {exams.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
          <Search className="mx-auto h-8 w-8 text-slate-500" />
          <p className="mt-3 font-semibold text-slate-200">Nenhum simulado disponível ainda.</p>
          <p className="mt-1 text-sm text-slate-500">Novas provas aparecerão aqui quando forem publicadas.</p>
        </div>
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
    </div>
  );
}
