// Importações necessárias para a página de histórico de simulados
import { auth } from "@/auth"; // Função para obter sessão do usuário
import { getUserExamStats, listUserAttempts } from "@/services/exam.service"; // Serviços de simulado
import Link from "next/link"; // Componente de link do Next.js
import { redirect } from "next/navigation"; // Função para redirecionar

// Página de histórico de simulados do usuário
// Exibe estatísticas e lista de tentativas, aplica tema azul e preto
export default async function HistoricoPage() {
  const session = await auth(); // Obtém sessão do usuário
  if (!session?.user?.id) redirect("/login?callbackUrl=/simulados/historico"); // Redireciona se não estiver logado

  // Busca tentativas e estatísticas em paralelo
  const [attempts, stats] = await Promise.all([
    listUserAttempts(session.user.id),
    getUserExamStats(session.user.id),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/simulados" className="text-sm text-sky-300 hover:underline" aria-label="Voltar para simulados">
        ← Simulados
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-white">Meu histórico</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Tentativas</p>
          <p className="text-2xl font-bold text-white">{stats.totalAttempts}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Média</p>
          <p className="text-2xl font-bold text-white">{stats.averageScore}%</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Melhor nota</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.bestScore}%</p>
        </div>
      </div>

      {attempts.length === 0 ? (
        <p className="mt-8 text-slate-400">Você ainda não finalizou nenhum simulado.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {attempts.map((attempt) => (
            <li key={attempt.id}>
              <Link
                href={`/simulados/${attempt.exam.slug}/resultado/${attempt.id}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-4 hover:border-sky-400/35"
                aria-label={`Ver resultado de ${attempt.exam.title}: ${Math.round(attempt.score)}%`}
              >
                <div>
                  <p className="font-semibold text-white">{attempt.exam.title}</p>
                  <p className="text-sm text-slate-400">
                    {attempt.correctAnswers}/{attempt.totalQuestions} acertos ·{" "}
                    {attempt.finishedAt?.toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span
                  className={`text-lg font-bold ${
                    attempt.score >= 70 ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {Math.round(attempt.score)}%
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
