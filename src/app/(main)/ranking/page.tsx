import Link from "next/link";
import { ArrowLeft, Medal, Sparkles, Trophy } from "lucide-react";
import { auth } from "@/auth";
import { getRanking } from "@/services/xp.service";

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
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/perfil" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300 hover:text-sky-200" aria-label="Voltar para meu perfil">
        <ArrowLeft className="h-4 w-4" />
        Meu perfil
      </Link>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
          <Trophy className="h-3.5 w-3.5" />
          Ranking
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-white">Top estudantes</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Estudantes com mais XP acumulado na plataforma.
        </p>
      </div>

      {error ? (
        <div className="mt-8 rounded-xl border border-red-400/20 bg-red-500/10 p-6 text-center">
          <p className="text-sm text-red-200">Erro ao carregar ranking. Tente novamente mais tarde.</p>
        </div>
      ) : ranking.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center text-sm text-slate-400">
          Ninguém no ranking ainda. Seja o primeiro a ganhar XP!
        </p>
      ) : (
        <ol className="mt-8 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/20">
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
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${medalClass}`}>
                  {index < 3 ? <Medal className="h-5 w-5" /> : index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-white">
                      @{entry.user.username}
                    </p>
                    {isCurrentUser && (
                      <span className="rounded-full bg-sky-400/10 px-2 py-0.5 text-xs font-medium text-sky-200">
                        Você
                      </span>
                    )}
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
    </div>
  );
}
