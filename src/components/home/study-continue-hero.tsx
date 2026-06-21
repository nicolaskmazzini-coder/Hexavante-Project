import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Play, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { StudyContinuation } from "@/services/study-continuation.service";

type Props = {
  continuation: StudyContinuation | null;
};

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "agora há pouco";
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ontem";
  return `há ${days} dias`;
}

export function StudyContinueHero({ continuation }: Props) {
  if (!continuation) {
    return (
      <Card
        padding="md"
        data-tour="study-continue"
        className="border-dashed border-sky-400/20 bg-sky-400/5"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="sky">Comece sua jornada</Badge>
            <h2 className="mt-3 text-xl font-bold text-white">Nenhum estudo em andamento</h2>
            <p className="mt-2 text-sm text-slate-400">
              Matricule-se em um curso ou faça um simulado para retomar daqui.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/courses" className="min-h-11">
              <BookOpen className="h-4 w-4" />
              Explorar cursos
            </LinkButton>
            <LinkButton href="/simulados" variant="outline" className="min-h-11">
              <Target className="h-4 w-4" />
              Simulados
            </LinkButton>
          </div>
        </div>
      </Card>
    );
  }

  const isExam = continuation.type === "exam";

  return (
    <Card
      padding="md"
      data-tour="study-continue"
      className="overflow-hidden border-sky-400/25 bg-gradient-to-br from-sky-500/10 via-transparent to-teal-500/5 shadow-xl shadow-sky-950/20"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="sky">
              {isExam ? <Target className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              Continue estudando
            </Badge>
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              {formatRelative(continuation.lastStudyAt)}
            </span>
          </div>

          <h2 className="mt-3 truncate text-2xl font-black text-white">
            {isExam ? continuation.examTitle : continuation.courseTitle}
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            {isExam
              ? `Última nota: ${Math.round(continuation.examScore ?? continuation.progress)}% — tente melhorar`
              : `Próxima aula: ${continuation.lessonTitle}`}
          </p>

          {!isExam && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-slate-400">
                <span>Progresso do curso</span>
                <span>{Math.round(continuation.progress)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-teal-400 transition-all"
                  style={{ width: `${Math.min(100, continuation.progress)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <Link
          href={continuation.href}
          className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-400"
        >
          {isExam ? "Ver simulado" : "Retomar aula"}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </Card>
  );
}
