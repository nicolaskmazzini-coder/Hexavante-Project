import Link from "next/link";
import { redirect } from "next/navigation";
import { Award, BarChart3, History, Sparkles, Trophy, UserRound } from "lucide-react";
import { auth } from "@/auth";
import { LevelUpCelebration } from "@/components/gamification/level-up-celebration";
import { XpProgressBar } from "@/components/gamification/xp-progress-bar";
import { MyJourney } from "@/components/profile/my-journey";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { ProfilePhotoUpload } from "@/components/profile/profile-photo-upload";
import { PageShell } from "@/components/ui/page-shell";
import { getUserProfile, listUserEnrollments } from "@/services/student.service";
import { getUserRank, getUserXpProfile, getXpHistory } from "@/services/xp.service";

type Props = {
  searchParams: Promise<{ levelUp?: string }>;
};

export default async function PerfilPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/perfil");

  const { levelUp } = await searchParams;
  const celebrateLevel = levelUp ? Number(levelUp) : undefined;

  const [profile, userProfile, enrollments, history, rank] = await Promise.all([
    getUserXpProfile(session.user.id),
    getUserProfile(session.user.id),
    listUserEnrollments(session.user.id),
    getXpHistory(session.user.id),
    getUserRank(session.user.id),
  ]);

  if (!profile || !userProfile) {
    return (
      <PageShell size="md">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-8 text-slate-400">
          Perfil não encontrado.
        </div>
      </PageShell>
    );
  }

  const xpRemaining = Math.max(profile.xpToNextLevel - profile.currentXp, 0);

  return (
    <PageShell>
      <LevelUpCelebration
        level={celebrateLevel && !Number.isNaN(celebrateLevel) ? celebrateLevel : undefined}
        showAnimation={Boolean(celebrateLevel && !Number.isNaN(celebrateLevel))}
      />
      <section className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/25">
        <div className="h-28 bg-gradient-to-r from-sky-500/25 via-blue-500/20 to-teal-400/20" />
        <div className="grid gap-6 p-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="-mt-20 flex justify-center lg:justify-start">
            <ProfilePhotoUpload
              currentAvatar={session.user.image || userProfile.avatarUrl || undefined}
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-200">
                  <UserRound className="h-3.5 w-3.5" />
                  Perfil do estudante
                </div>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-white">
                  {userProfile.fullName}
                </h1>
                <p className="mt-1 text-slate-400">@{userProfile.username}</p>
                {userProfile.bio && (
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">{userProfile.bio}</p>
                )}
              </div>
              <Link
                href="/ranking"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-sky-400/35 hover:bg-sky-400/10"
                aria-label="Ver ranking"
              >
                <Trophy className="h-4 w-4 text-amber-300" />
                Ver ranking
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-slate-950/35 p-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Sparkles className="h-4 w-4 text-sky-300" />
                  <span className="text-xs font-semibold uppercase">Nível</span>
                </div>
                <p className="mt-2 text-3xl font-black text-sky-200">{profile.level}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/35 p-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Award className="h-4 w-4 text-teal-300" />
                  <span className="text-xs font-semibold uppercase">XP total</span>
                </div>
                <p className="mt-2 text-3xl font-black text-white">
                  {profile.totalXp.toLocaleString("pt-BR")}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/35 p-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <BarChart3 className="h-4 w-4 text-amber-300" />
                  <span className="text-xs font-semibold uppercase">Ranking</span>
                </div>
                <p className="mt-2 text-3xl font-black text-white">{rank ? `#${rank}` : "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <ProfileEditForm profile={userProfile} />

        <section className="rounded-xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20">
          <h2 className="text-lg font-bold text-white">Progresso do nível</h2>
          <p className="mt-1 text-sm text-slate-400">
            Faltam {xpRemaining.toLocaleString("pt-BR")} XP para o próximo nível.
          </p>
          <div className="mt-5">
            <XpProgressBar {...profile} />
          </div>
          <div className="mt-6 space-y-3 border-t border-white/10 pt-4 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>XP no nível</span>
              <span className="font-semibold text-white">
                {profile.currentXp.toLocaleString("pt-BR")}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Meta do nível</span>
              <span className="font-semibold text-white">
                {profile.xpToNextLevel.toLocaleString("pt-BR")}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Eventos de XP</span>
              <span className="font-semibold text-white">{history.length}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8">
        <MyJourney enrollments={enrollments} />
      </div>

      <section className="mt-8">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-sky-300" />
          <h2 className="text-lg font-bold text-white">Histórico de XP</h2>
        </div>

        {history.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-slate-500" />
            <p className="mt-3 font-semibold text-slate-200">Nenhuma atividade registrada ainda.</p>
            <p className="mt-1 text-sm text-slate-500">Conclua aulas ou simulados para ganhar XP.</p>
          </div>
        ) : (
          <ul className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/20">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-4 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {entry.description ?? entry.source}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {entry.createdAt.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-sky-400/10 px-3 py-1 text-sm font-semibold text-sky-200">
                  +{entry.amount} XP
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
