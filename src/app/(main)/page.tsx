import { auth } from "@/auth";
import { ArrowRight, Award, BookOpen, Radio, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";
import { StudentDashboard } from "@/components/home/student-dashboard";
import { StudyContinueHero } from "@/components/home/study-continue-hero";
import { CourseRecommendations } from "@/components/home/course-recommendations";
import { PersonalStatsPanel } from "@/components/home/personal-stats-panel";
import { DashboardCommandCenter } from "@/components/home/dashboard-command-center";
import { DashboardHighlightsPanel } from "@/components/home/dashboard-highlights-panel";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { AchievementGrid } from "@/components/achievements/achievement-grid";
import { getStudentHomeData } from "@/services/student.service";
import Link from "next/link";

const highlights = [
  {
    label: "Cursos",
    value: "Aprendizado guiado",
    icon: BookOpen,
    tone: "text-sky-300 bg-sky-400/10",
  },
  {
    label: "Simulados",
    value: "Prática com desempenho",
    icon: Target,
    tone: "text-teal-300 bg-teal-400/10",
  },
  {
    label: "Certificados",
    value: "Evolução registrada",
    icon: Award,
    tone: "text-amber-300 bg-amber-400/10",
  },
];

const shortcuts = [
  { href: "/courses", label: "Catálogo de cursos", icon: BookOpen },
  { href: "/simulados", label: "Simulados", icon: Target },
  { href: "/live-rooms", label: "Aulas ao vivo", icon: Radio },
];

export default async function HomePage() {
  const session = await auth();
  const homeData = session?.user?.id ? await getStudentHomeData(session.user.id) : null;

  return (
    <PageShell>
      {homeData?.showOnboardingTour && <OnboardingTour show />}

      {homeData && session?.user ? (
        <>
          <section className="mb-8">
            <Badge variant="sky">Seu espaço de estudos</Badge>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Olá, {session.user.name?.split(" ")[0] ?? session.user.username}!
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
              Retome de onde parou, acompanhe suas estatísticas e descubra novos cursos.
            </p>
          </section>

          <StudyContinueHero continuation={homeData.continuation} />

          <DashboardCommandCenter pendingItems={homeData.pendingItems} />

          <DashboardHighlightsPanel highlights={homeData.highlights} />

          <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
            <div className="min-w-0 space-y-8">
              <PersonalStatsPanel stats={homeData.stats} />
              <CourseRecommendations courses={homeData.recommendations} />

              {homeData.achievements.some((a) => a.unlocked) && (
                <section>
                  <h2 className="mb-4 text-lg font-bold text-white">Conquistas recentes</h2>
                  <AchievementGrid
                    achievements={homeData.achievements.filter((a) => a.unlocked).slice(0, 4)}
                    compact
                  />
                </section>
              )}
            </div>

            <StudentDashboard
              data={homeData}
              userName={session.user.name ?? session.user.username ?? "Estudante"}
            />
          </div>
        </>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-8">
          <div className="min-w-0">
            <Badge variant="sky">Plataforma educacional Hexavante</Badge>
            <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-white sm:mt-5 sm:text-4xl xl:text-5xl">
              Aprenda, pratique e acompanhe seu progresso em um só lugar.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:mt-5 sm:text-base lg:text-lg">
              Cursos, simulados, aulas ao vivo e gamificação para estudantes do ensino técnico,
              universitários de TI e candidatos ao ENEM.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/courses" size="lg">
                Explorar cursos
                <ArrowRight className="h-4 w-4" />
              </LinkButton>
              <LinkButton href="/register" variant="outline" size="lg">
                Criar conta
              </LinkButton>
            </div>
          </div>

          <Card padding="md" className="min-w-0 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-sm font-semibold text-white">Comece agora</p>
                <p className="mt-1 text-xs text-slate-400">Tudo em uma plataforma</p>
              </div>
              <Badge variant="teal">Gratuito</Badge>
            </div>
            <div className="mt-5 grid gap-3">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.04] p-4"
                  >
                    <span className={`grid h-10 w-10 place-items-center rounded-lg ${item.tone}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>
      )}

      <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.035] p-4 transition hover:border-sky-400/35 hover:bg-sky-400/10"
            >
              <span className="flex items-center gap-3 text-sm font-semibold text-slate-100">
                <Icon className="h-4 w-4 text-sky-300" />
                {item.label}
              </span>
              <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-sky-200" />
            </Link>
          );
        })}
      </section>
    </PageShell>
  );
}
