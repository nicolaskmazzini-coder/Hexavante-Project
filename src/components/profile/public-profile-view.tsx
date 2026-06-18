import { ProfileIconBadge } from "@/components/profile/profile-icon-badge";
import { StartMessageButton } from "@/components/messages/start-message-button";
import Link from "next/link";
import { Award, BarChart3, Pencil, Settings, Sparkles, Store, Trophy } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { FollowButton } from "@/components/social/follow-button";
import { ProfileTabs } from "./profile-tabs";
import type { getPublicProfile } from "@/services/public-profile.service";

type ProfileData = NonNullable<Awaited<ReturnType<typeof getPublicProfile>>>;

type Props = {
  profile: ProfileData;
  viewerId?: string;
};

export function PublicProfileView({ profile, viewerId }: Props) {
  const {
    user,
    isOwner,
    isPrivate,
    xp,
    rank,
    followCounts,
    isFollowing,
    completedCourses,
    cosmetics,
    enrollments,
    activities,
  } = profile;

  if (isPrivate) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#111120] p-10 text-center">
        <p className="text-lg font-semibold text-white">Este perfil é privado</p>
        <p className="mt-2 text-sm text-slate-400">
          @{user.username} restringiu a visualização do perfil.
        </p>
      </div>
    );
  }

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-[#1e1e2e] bg-[#111120] shadow-2xl shadow-black/25">
        <div className="h-28 bg-gradient-to-r from-sky-500/20 via-blue-500/15 to-teal-400/15" />
        <div className="grid gap-6 p-6 lg:grid-cols-[180px_minmax(0,1fr)]">
          <div className="-mt-16 flex justify-center lg:justify-start">
            <Avatar
              src={user.avatarUrl}
              alt={user.username}
              size="lg"
              borderClassName={cosmetics?.avatarBorderClassName}
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-black tracking-tight text-white">{user.fullName}</h1>
                  {cosmetics?.profileIconId && (
                    <ProfileIconBadge iconId={cosmetics.profileIconId} />
                  )}
                </div>
                <p className="mt-1 text-slate-400">@{user.username}</p>
                {user.bio && (
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">{user.bio}</p>
                )}
                {xp && (
                  <p className="mt-3 text-sm text-slate-400">
                    Nível {xp.level} · {xp.totalXp.toLocaleString("pt-BR")} XP total
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {isOwner ? (
                  <>
                    <Link
                      href="/configuracoes/perfil"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-1.5 text-sm font-semibold text-slate-200 transition hover:border-white/40 hover:text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar perfil
                    </Link>
                    <Link
                      href="/configuracoes"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-sm font-semibold text-slate-200 transition hover:border-white/40 hover:text-white"
                      aria-label="Configurações"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber-400/35 hover:bg-amber-400/10"
                    >
                      <Store className="h-4 w-4 text-amber-300" />
                      Loja
                    </Link>
                  </>
                ) : viewerId ? (
                  <>
                    <FollowButton userId={user.id} initialFollowing={isFollowing} />
                    <StartMessageButton
                      recipientUserId={user.id}
                      recipientName={user.fullName}
                      className="rounded-full px-4 py-1.5"
                    />
                  </>
                ) : (
                  <Link
                    href={`/login?callbackUrl=/perfil/${user.username}`}
                    className="hx-btn-primary"
                  >
                    Entrar para seguir
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-300">
              <span>
                <strong className="text-white">{followCounts.followers}</strong> seguidores
              </span>
              <span>
                <strong className="text-white">{followCounts.following}</strong> seguindo
              </span>
              <span>
                <strong className="text-white">{completedCourses}</strong> cursos concluídos
              </span>
            </div>

            {isOwner && xp && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-slate-950/35 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Sparkles className="h-4 w-4 text-sky-300" />
                    <span className="text-xs font-semibold uppercase">Nível</span>
                  </div>
                  <p className="mt-2 text-3xl font-black text-sky-200">{xp.level}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/35 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <BarChart3 className="h-4 w-4 text-amber-300" />
                    <span className="text-xs font-semibold uppercase">Ranking</span>
                  </div>
                  <p className="mt-2 text-3xl font-black text-white">{rank ? `#${rank}` : "-"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/35 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Trophy className="h-4 w-4 text-amber-300" />
                    <span className="text-xs font-semibold uppercase">Conquistas</span>
                  </div>
                  <p className="mt-2 text-3xl font-black text-white">{completedCourses}</p>
                </div>
                {cosmetics?.equippedTitle && (
                  <div className="rounded-xl border border-white/10 bg-slate-950/35 p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Award className="h-4 w-4 text-teal-300" />
                      <span className="text-xs font-semibold uppercase">Título</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {cosmetics.equippedTitle}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <ProfileTabs
        activities={activities}
        enrollments={enrollments}
        equippedTitle={cosmetics?.equippedTitle ?? null}
        canInteract={Boolean(viewerId)}
      />
    </>
  );
}
