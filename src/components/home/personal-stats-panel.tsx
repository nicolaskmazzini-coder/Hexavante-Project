import Link from "next/link";
import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  Coins,
  Flame,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { XpProgressBar } from "@/components/gamification/xp-progress-bar";
import type { PersonalStats } from "@/services/personal-stats.service";

type Props = {
  stats: PersonalStats;
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "text-sky-300",
}: {
  icon: typeof Zap;
  label: string;
  value: string | number;
  sub?: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className={`flex items-center gap-2 text-xs font-semibold uppercase text-slate-400`}>
        <Icon className={`h-4 w-4 ${tone}`} />
        {label}
      </div>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export function PersonalStatsPanel({ stats }: Props) {
  return (
    <section data-tour="personal-stats" className="mt-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-sky-300" />
            <h2 className="text-lg font-bold text-white">Suas estatísticas</h2>
          </div>
          <p className="mt-1 text-sm text-slate-400">Visão detalhada do seu progresso</p>
        </div>
        <Link
          href="/perfil"
          className="text-sm font-semibold text-sky-300 hover:text-sky-200"
        >
          Ver perfil completo →
        </Link>
      </div>

      <Card padding="md" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="sky">Nível {stats.level}</Badge>
              {stats.rank && (
                <Badge variant="default">
                  <Trophy className="h-3.5 w-3.5" />
                  #{stats.rank} no ranking
                </Badge>
              )}
              {stats.studyStreakDays > 0 && (
                <Badge variant="emerald">
                  <Flame className="h-3.5 w-3.5" />
                  {stats.studyStreakDays} dias seguidos
                </Badge>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {stats.totalXp.toLocaleString("pt-BR")} XP total · {stats.xpThisWeek.toLocaleString("pt-BR")} XP esta semana
            </p>
          </div>
          <div className="min-w-[200px] flex-1 sm:max-w-xs">
            <XpProgressBar
              level={stats.level}
              currentXp={Math.round((stats.progressPercent / 100) * stats.xpToNextLevel)}
              xpToNextLevel={stats.xpToNextLevel}
              progressPercent={stats.progressPercent}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={BookOpen} label="Aulas concluídas" value={stats.lessonsCompleted} />
          <StatCard
            icon={Award}
            label="Cursos concluídos"
            value={stats.coursesCompleted}
            sub={`${stats.coursesEnrolled} matriculados`}
            tone="text-teal-300"
          />
          <StatCard
            icon={Target}
            label="Simulados"
            value={stats.examsTaken}
            sub={
              stats.averageExamScore != null
                ? `Média ${Math.round(stats.averageExamScore)}% · ${stats.examsPassed} aprovados`
                : `${stats.examsPassed} aprovados`
            }
            tone="text-amber-300"
          />
          <StatCard
            icon={Coins}
            label="Moedas"
            value={stats.coins.toLocaleString("pt-BR")}
            sub={`${stats.certificatesCount} certificados`}
            tone="text-yellow-300"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            icon={Zap}
            label="Conquistas"
            value={`${stats.achievementsUnlocked}/${stats.achievementsTotal}`}
            sub="Desbloqueadas no perfil"
            tone="text-violet-300"
          />
          <StatCard
            icon={Calendar}
            label="Dias ativos"
            value={stats.activeDays}
            sub="Com atividade registrada"
            tone="text-slate-300"
          />
          <StatCard
            icon={Flame}
            label="Sequência"
            value={stats.studyStreakDays > 0 ? `${stats.studyStreakDays} dias` : "—"}
            sub="Estudando em dias consecutivos"
            tone="text-orange-300"
          />
        </div>
      </Card>
    </section>
  );
}
