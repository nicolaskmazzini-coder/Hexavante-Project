// Importações necessárias para a página de moderação de instrutores
import { auth } from "@/auth"; // Função para obter sessão do usuário
import {
  approveInstructorAction,
  rejectInstructorAction,
} from "@/app/actions/moderation"; // Actions para aprovar/rejeitar instrutores
import { canModerate } from "@/lib/permissions"; // Função para verificar permissão de moderador
import { listPendingInstructorApplications } from "@/services/moderation.service"; // Serviço para listar solicitações pendentes
import Link from "next/link"; // Componente de link do Next.js
import { redirect } from "next/navigation"; // Função para redirecionar

// Página de moderação de solicitações de instrutor
// Exibe e permite aprovar/rejeitar solicitações, aplica tema azul e preto
export default async function ModerateInstructorsPage() {
  const session = await auth(); // Obtém sessão do usuário
  if (!session?.user?.id) redirect("/login?callbackUrl=/moderacao/instrutores"); // Redireciona se não estiver logado
  if (!canModerate(session.user.roles)) redirect("/"); // Redireciona se não for moderador

  const applications = await listPendingInstructorApplications(); // Busca solicitações pendentes

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/moderacao" className="text-sm text-sky-300 hover:underline" aria-label="Voltar para moderação">
        ← Moderação
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Solicitações de instrutor</h1>

      {applications.length === 0 ? (
        <p className="mt-8 text-slate-400">Nenhuma solicitação pendente.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {applications.map((app) => (
            <li key={app.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">{app.user.fullName}</p>
                  <p className="text-sm text-slate-400">
                    @{app.user.username} · {app.user.email}
                  </p>
                  <p className="mt-3 text-sm text-slate-300">
                    <strong>Motivação:</strong> {app.motivation}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    <strong>Experiência:</strong> {app.experience}
                  </p>
                  {app.portfolioUrl && (
                    <a
                      href={app.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm text-sky-300 hover:underline"
                    >
                      Ver portfólio
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <form action={approveInstructorAction.bind(null, app.id)}>
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
                    >
                      Aprovar
                    </button>
                  </form>
                  <form action={rejectInstructorAction.bind(null, app.id)}>
                    <button
                      type="submit"
                      className="rounded-lg border border-red-900/50 px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/10"
                    >
                      Rejeitar
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
