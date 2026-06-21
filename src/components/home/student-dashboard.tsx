import Link from "next/link";
import { ArrowRight, Award, BookOpen, Sparkles, Target, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { XpProgressBar } from "@/components/gamification/xp-progress-bar";
import type { getStudentHomeData } from "@/services/student.service";

type DashboardData = Awaited<ReturnType<typeof getStudentHomeData>>;

type Props = {
  data: DashboardData;
  userName: string;
};

export function StudentDashboard({ data, userName }: Props) {
  const { xpProfile, inProgress, completedCount, recentXp, lastExam, continuation } = data;

  return (
    <Card padding="md" className="shadow-2xl shadow-black/30 backdrop-blur">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-sm font-semibold text-white">Olá, {userName.split(" ")[0]}!</p>
          <p className="mt-1 text-xs text-slate-400">Seu painel de estudos</p>
        </div>
        {xpProfile && (
          <Badge variant="sky">
            <Sparkles className="h-3.5 w-3.5" />
            Nível {xpProfile.level}
          </Badge>
        )}
      </div>

      {xpProfile && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span>{xpProfile.totalXp.toLocaleString("pt-BR")} XP total</span>
            <span>{xpProfile.progressPercent}% do nível</span>
          </div>
          <XpProgressBar {...xpProfile} />
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-white/8 bg-white/[0.04] p-3">
          <p className="text-xs text-slate-400">Em andamento</p>
          <p className="mt-1 text-2xl font-bold text-white">{inProgress.length}</p>
        </div>
        <div className="rounded-lg border border-white/8 bg-white/[0.04] p-3">
          <p className="text-xs text-slate-400">Concluídos</p>
          <p className="mt-1 text-2xl font-bold text-white">{completedCount}</p>
        </div>
        <div className="rounded-lg border border-white/8 bg-white/[0.04] p-3">
          <p className="text-xs text-slate-400">Ranking</p>
          <Link
            href="/ranking"
            className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-sky-300 hover:text-sky-200"
          >
            <Trophy className="h-4 w-4" />
            Ver top
          </Link>
        </div>
      </div>

      {inProgress.length > 0 && !data.continuation ? (
        <div className="mt-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Continue estudando
          </p>
          {inProgress.map((enrollment) => (
            <Link
              key={enrollment.id}
              href={`/courses/${enrollment.course.slug}/learn`}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 transition hover:border-sky-400/30 hover:bg-sky-400/5"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">
                  {enrollment.course.title}
                </span>
                <span className="text-xs text-slate-400">
                  {Math.round(enrollment.progress)}% concluído
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-500" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-4 text-center">
          <BookOpen className="mx-auto h-6 w-6 text-slate-500" />
          <p className="mt-2 text-sm text-slate-300">Nenhum curso em andamento.</p>
          <LinkButton href="/courses" variant="outline" size="sm" className="mt-3">
            Explorar cursos
          </LinkButton>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
        <LinkButton href="/simulados" variant="outline" size="sm">
          <Target className="h-4 w-4" />
          Simulados
        </LinkButton>
        <LinkButton href="/certificados" variant="outline" size="sm">
          <Award className="h-4 w-4" />
          Certificados
        </LinkButton>
        <LinkButton href="/perfil" variant="ghost" size="sm">
          Meu perfil
        </LinkButton>
      </div>

      {(recentXp[0] || lastExam) && (
        <div className="mt-4 rounded-lg border border-white/8 bg-slate-950/30 p-3 text-xs text-slate-400">
          <p className="font-semibold text-slate-300">Última atividade</p>
          {recentXp[0] && (
            <p className="mt-1">
              +{recentXp[0].amount} XP — {recentXp[0].description ?? recentXp[0].source}
            </p>
          )}
          {lastExam && (
            <p className="mt-1">
              Simulado {lastExam.exam.title}: {Math.round(lastExam.score)}%
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
