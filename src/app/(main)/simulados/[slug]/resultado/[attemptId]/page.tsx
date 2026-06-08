// Importações necessárias para a página de resultado do simulado
import { auth } from "@/auth"; // Função para obter sessão do usuário
import { getAttemptResult } from "@/services/exam.service"; // Serviço para obter resultado da tentativa
import { getXpForSource } from "@/services/xp.service"; // Serviço para obter XP ganho
import Link from "next/link"; // Componente de link do Next.js
import { notFound, redirect } from "next/navigation"; // Funções de navegação

// Props da página de resultado
type Props = {
  params: Promise<{ slug: string; attemptId: string }>;
};

// Página de resultado do simulado
// Exibe pontuação, revisão de respostas e XP ganho, aplica tema azul e preto
export default async function ExamResultPage({ params }: Props) {
  const { slug, attemptId } = await params; // Obtém slug e ID da tentativa
  const session = await auth(); // Obtém sessão do usuário
  if (!session?.user?.id) redirect(`/login?callbackUrl=/simulados/${slug}`); // Redireciona se não estiver logado

  const attempt = await getAttemptResult(session.user.id, attemptId); // Busca resultado da tentativa
  if (!attempt || !attempt.finishedAt || attempt.exam.slug !== slug) notFound(); // Retorna 404 se não existir

  const passed = attempt.score >= 70; // Verifica se passou (70% ou mais)

  // Busca XP ganho pela tentativa e por passar
  const [baseXp, passXp] = await Promise.all([
    getXpForSource(session.user.id, "EXAM", attemptId),
    getXpForSource(session.user.id, "EXAM", `${attemptId}-pass`),
  ]);
  const totalXpEarned = (baseXp?.amount ?? 0) + (passXp?.amount ?? 0); // Calcula XP total ganho

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/simulados/historico" className="text-sm text-sky-300 hover:underline" aria-label="Voltar para histórico">
        ← Meu histórico
      </Link>

      <div
        className={`mt-6 rounded-xl border p-6 ${
          passed
            ? "border-emerald-900/50 bg-emerald-900/10"
            : "border-amber-900/50 bg-amber-900/10"
        }`}
      >
        <h1 className="text-2xl font-bold text-white">Resultado</h1>
        <p className="mt-1 text-slate-300">{attempt.exam.title}</p>
        <p className="mt-4 text-4xl font-bold text-white">
          {Math.round(attempt.score)}%
        </p>
        <p className="mt-2 text-slate-300">
          {attempt.correctAnswers} de {attempt.totalQuestions} questões corretas
        </p>
        {totalXpEarned > 0 && (
          <p className="mt-3 text-sm font-medium text-sky-300">
            +{totalXpEarned} XP ganhos neste simulado
          </p>
        )}
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="font-semibold text-white">Revisão das respostas</h2>
        {attempt.answers
          .sort((a, b) => a.question.orderNumber - b.question.orderNumber)
          .map((answer) => (
            <div
              key={answer.id}
              className={`rounded-lg border p-4 ${
                answer.isCorrect
                  ? "border-emerald-900/50 bg-emerald-900/10"
                  : "border-red-900/50 bg-red-900/10"
              }`}
            >
              <p className="font-medium text-white">
                {answer.question.orderNumber}. {answer.question.statement}
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Sua resposta: {answer.alternative.text}
              </p>
              <p
                className={`mt-1 text-sm font-medium ${
                  answer.isCorrect ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {answer.isCorrect ? "Correta" : "Incorreta"}
              </p>
            </div>
          ))}
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          href={`/simulados/${slug}`}
          className="rounded-lg border border-white/10 px-4 py-2 hover:bg-white/10 text-slate-300"
          aria-label="Refazer simulado"
        >
          Refazer simulado
        </Link>
        <Link
          href="/simulados"
          className="rounded-lg bg-[#2563eb] px-4 py-2 text-white hover:bg-[#1d4ed8]"
          aria-label="Ver outros simulados"
        >
          Ver outros simulados
        </Link>
      </div>
    </div>
  );
}
