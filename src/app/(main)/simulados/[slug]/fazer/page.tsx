// Importações necessárias para a página de fazer simulado
import { auth } from "@/auth"; // Função para obter sessão do usuário
import { ExamForm } from "@/components/exams/exam-form"; // Componente de formulário de simulado
import { getExamForTaking } from "@/services/exam.service"; // Serviço para obter simulado
import { prisma } from "@/lib/prisma"; // Cliente Prisma
import Link from "next/link"; // Componente de link do Next.js
import { notFound, redirect } from "next/navigation"; // Funções de navegação

// Props da página de fazer simulado
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ attempt?: string }>;
};

// Página para responder simulado
// Exibe formulário com questões, aplica tema azul e preto
export default async function TakeExamPage({ params, searchParams }: Props) {
  const { slug } = await params; // Obtém slug do simulado
  const { attempt: attemptId } = await searchParams; // Obtém ID da tentativa
  const session = await auth(); // Obtém sessão do usuário

  if (!session?.user?.id) redirect(`/login?callbackUrl=/simulados/${slug}`); // Redireciona se não estiver logado

  const exam = await getExamForTaking(slug); // Busca simulado para responder
  if (!exam || exam.questions.length === 0) notFound(); // Retorna 404 se não existir ou não tiver questões

  if (!attemptId) redirect(`/simulados/${slug}`); // Redireciona se não tiver ID de tentativa

  // Busca tentativa ativa do usuário
  const attempt = await prisma.examAttempt.findFirst({
    where: {
      id: attemptId,
      userId: session.user.id,
      examId: exam.id,
      finishedAt: null,
    },
  });

  if (!attempt) redirect(`/simulados/${slug}`); // Redireciona se tentativa não existir

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href={`/simulados/${slug}`} className="text-sm text-sky-300 hover:underline" aria-label="Voltar para detalhes do simulado">
        ← Voltar
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">{exam.title}</h1>
      <p className="mt-1 text-sm text-slate-300">
        Responda todas as questões e clique em finalizar.
      </p>

      <div className="mt-8">
        <ExamForm
          slug={slug}
          attemptId={attempt.id}
          title={exam.title}
          questions={exam.questions}
        />
      </div>
    </div>
  );
}
