import { Medal, Sparkles, Trophy } from "lucide-react";
import { auth } from "@/auth";
import { RankingFilters } from "@/components/ranking/ranking-filters";
import { RankingPodium } from "@/components/ranking/ranking-podium";
import { AppLink } from "@/components/ui/app-link";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { getRanking, type RankingPeriod } from "@/services/xp.service";

type Props = {
  searchParams: Promise<{ period?: string }>;
};

const PERIOD_LABELS: Record<RankingPeriod, string> = {
  week: "semanal",
  month: "mensal",
  all: "geral",
};

function parsePeriod(value?: string): RankingPeriod {
  if (value === "week" || value === "month" || value === "all") return value;
  return "all";
}

export default async function RankingPage({ searchParams }: Props) {
  const session = await auth();
  const { period: periodParam } = await searchParams;
  const period = parsePeriod(periodParam);
  let ranking: Awaited<ReturnType<typeof getRanking>> = [];
  let error: string | null = null;

  try {
    ranking = await getRanking(50, period);
  } catch (e) {
    error = e instanceof Error ? e.message : "Erro ao carregar ranking";
    console.error("Erro ao carregar ranking:", error);
  }

  const showPodium = ranking.length >= 3;
  const listStartIndex = showPodium ? 3 : 0;
  const rest = ranking.slice(listStartIndex);

  return (
    <PageShell size="md">
      <AppLink href="/perfil" muted className="mb-4 inline-flex items-center gap-1">
        ← Meu perfil
      </AppLink>

      <PageHeader
        badge="Ranking"
        icon={Trophy}
        title="Top estudantes"
        description="Estudantes com mais XP na plataforma."
      />

      <div className="mt-4">
        <RankingFilters current={period} />
      </div>

      {error ? (
        <Alert variant="danger" className="mt-6 p-6 text-center">
          Erro ao carregar ranking. Tente novamente mais tarde.
        </Alert>
      ) : ranking.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Ninguém no ranking ainda."
          description="Seja o primeiro a ganhar XP!"
        />
      ) : (
        <>
          {showPodium && (
            <RankingPodium
              entries={ranking}
              currentUserId={session?.user?.id}
              periodLabel={PERIOD_LABELS[period]}
            />
          )}

          {rest.length > 0 && (
          <ol className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/20">
            {rest.map((entry, index) => {
              const position = listStartIndex + index + 1;
              const isCurrentUser = session?.user?.id === entry.userId;

              return (
                <li
                  key={entry.id}
                  className={`flex items-center gap-4 border-b border-white/10 px-4 py-4 last:border-b-0 transition hover:bg-sky-400/5 ${
                    isCurrentUser ? "bg-sky-400/10" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-sm font-bold text-slate-400">
                    {position}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-white">@{entry.user.username}</p>
                      {isCurrentUser && <Badge variant="sky">Você</Badge>}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                      <Sparkles className="h-4 w-4 text-sky-300" />
                      Nível {entry.level}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-sky-200">
                      {entry.periodXp.toLocaleString("pt-BR")} XP
                    </p>
                    {period !== "all" && (
                      <p className="text-xs text-slate-500">
                        Total: {entry.totalXp.toLocaleString("pt-BR")}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          )}
        </>
      )}
    </PageShell>
  );
}
