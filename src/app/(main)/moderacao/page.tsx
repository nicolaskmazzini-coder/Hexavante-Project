// Importações necessárias para a página de moderação
import { auth } from "@/auth"; // Função para obter sessão do usuário
import { canModerate } from "@/lib/permissions"; // Função para verificar permissão de moderador
import { getModerationCounts } from "@/services/moderation.service"; // Serviço para obter contagens de moderação
import Link from "next/link"; // Componente de link do Next.js
import { redirect } from "next/navigation"; // Função para redirecionar

// Página de dashboard de moderação
// Exibe contagens de solicitações pendentes, aplica tema azul e preto
export default async function ModerationDashboardPage() {
  const session = await auth(); // Obtém sessão do usuário
  if (!session?.user?.id) redirect("/login?callbackUrl=/moderacao"); // Redireciona se não estiver logado
  if (!canModerate(session.user.roles)) redirect("/"); // Redireciona se não for moderador

  const counts = await getModerationCounts(); // Busca contagens de pendências

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-white">Moderação</h1>
      <p className="mt-2 text-slate-300">Aprove instrutores e cursos da plataforma.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/moderacao/instrutores"
          className="rounded-xl border border-white/10 bg-white/[0.04] p-6 hover:border-sky-400/35"
          aria-label="Ver solicitações de instrutor"
        >
          <p className="text-3xl font-bold text-sky-300">{counts.pendingApplications}</p>
          <p className="mt-1 font-medium text-white">Solicitações de instrutor</p>
          <p className="mt-1 text-sm text-slate-400">Pendentes de análise</p>
        </Link>
        <Link
          href="/moderacao/cursos"
          className="rounded-xl border border-white/10 bg-white/[0.04] p-6 hover:border-sky-400/35"
          aria-label="Ver cursos pendentes"
        >
          <p className="text-3xl font-bold text-sky-300">{counts.pendingCourses}</p>
          <p className="mt-1 font-medium text-white">Cursos pendentes</p>
          <p className="mt-1 text-sm text-slate-400">Aguardando publicação</p>
        </Link>
      </div>
    </div>
  );
}
