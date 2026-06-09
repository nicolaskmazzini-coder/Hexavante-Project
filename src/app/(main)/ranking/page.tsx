import { Medal, Sparkles, Trophy } from "lucide-react";
import { auth } from "@/auth";
import { getRanking } from "@/services/xp.service";
import { AppLink } from "@/components/ui/app-link";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";

export default async function RankingPage() {
  const session = await auth();
  let ranking: any[] = [];
  let error = null;

  try {
    ranking = await getRanking(50);
  } catch (e) {
    error = e instanceof Error ? e.message : "Erro ao carregar ranking";
    console.error("Erro ao carregar ranking:", error);
  }

  return (
    <PageShell size="md">
      <AppLink href="/perfil" muted className="mb-4 inline-flex items-center gap-1">
        ← Meu perfil
      </AppLink>

      <PageHeader
        badge="Ranking"
        icon={Trophy}
        title="Top estudantes"
        description="Estudantes com mais XP acumulado na plataforma."
      />

      {error ? (
        <Alert variant="danger" className="mt-2 p-6 text-center">
          Erro ao carregar ranking. Tente novamente mais tarde.
        </Alert>
      ) : ranking.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Ninguém no ranking ainda."
          description="Seja o primeiro a ganhar XP!"
        />
      ) : (
        <ol className="mt-2 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/20">
          {ranking.map((entry, index) => {
            const isCurrentUser = session?.user?.id === entry.userId;
            const medalClass =
              index === 0
                ? "bg-amber-400/15 text-amber-200"
                : index === 1
                  ? "bg-slate-300/15 text-slate-200"
                  : index === 2
                    ? "bg-orange-400/15 text-orange-200"
                    : "bg-white/[0.05] text-slate-400";

            return (
              <li
                key={entry.id}
                className={`flex items-center gap-4 border-b border-white/10 px-4 py-4 last:border-b-0 transition hover:bg-sky-400/5 ${
                  isCurrentUser ? "bg-sky-400/10" : ""
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${medalClass}`}
                >
                  {index < 3 ? <Medal className="h-5 w-5" /> : index + 1}
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
                    {entry.totalXp.toLocaleString("pt-BR")} XP
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </PageShell>
  );
}
