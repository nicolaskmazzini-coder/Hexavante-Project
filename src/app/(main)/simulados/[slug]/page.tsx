// Importações necessárias para a página de detalhes do simulado
import { auth } from "@/auth"; // Função para obter sessão do usuário
import { startExamAction } from "@/app/actions/exam"; // Action para iniciar simulado
import { EXAM_TYPE_LABELS } from "@/lib/validations/exam"; // Labels para tipos de simulado
import { getExamBySlug } from "@/services/exam.service"; // Serviço para obter simulado
import Link from "next/link"; // Componente de link do Next.js
import { notFound } from "next/navigation"; // Função para página não encontrada

// Props da página de detalhes
type Props = { params: Promise<{ slug: string }> };

// Página de detalhes do simulado
// Exibe informações do simulado e botão para iniciar, aplica tema azul e preto
export default async function ExamDetailPage({ params }: Props) {
  const { slug } = await params; // Obtém slug do simulado
  const session = await auth(); // Obtém sessão do usuário
  const exam = await getExamBySlug(slug); // Busca simulado pelo slug

  if (!exam || !exam.isPublished) notFound(); // Retorna 404 se não existir ou não estiver publicado

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/simulados" className="text-sm text-sky-300 hover:underline" aria-label="Voltar para simulados">
        ← Simulados
      </Link>

      <span className="mt-4 inline-block rounded-full bg-[#2563eb] px-2.5 py-0.5 text-xs font-medium text-white">
        {EXAM_TYPE_LABELS[exam.examType] ?? exam.examType}
      </span>
      <h1 className="mt-2 text-3xl font-bold text-white">{exam.title}</h1>

      {exam.description && (
        <p className="mt-4 text-slate-300">{exam.description}</p>
      )}

      <div className="mt-4 flex gap-4 text-sm text-slate-400">
        <span>{exam._count.questions} questões</span>
        {exam.timeLimit && <span>Tempo sugerido: {exam.timeLimit} min</span>}
      </div>

      <div className="mt-8">
        {session?.user ? (
          <form action={startExamAction.bind(null, exam.id, slug)}>
            <button
              type="submit"
              className="rounded-lg bg-[#2563eb] px-6 py-3 font-medium text-white hover:bg-[#1d4ed8]"
            >
              Iniciar simulado
            </button>
          </form>
        ) : (
          <Link
            href={`/login?callbackUrl=/simulados/${slug}`}
            className="inline-block rounded-lg bg-[#2563eb] px-6 py-3 font-medium text-white hover:bg-[#1d4ed8]"
            aria-label="Entrar para iniciar simulado"
          >
            Entrar para iniciar
          </Link>
        )}
      </div>
    </div>
  );
}
