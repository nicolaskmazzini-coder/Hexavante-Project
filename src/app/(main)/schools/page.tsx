// Importações necessárias para a página de escolas
import { auth } from "@/auth"; // Função para obter sessão do usuário
import { INSTITUTION_ROLE_LABELS } from "@/lib/school-permissions"; // Labels para papéis institucionais
import { listUserSchools } from "@/services/school.service"; // Serviço para listar escolas do usuário
import Link from "next/link"; // Componente de link do Next.js
import { redirect } from "next/navigation"; // Função para redirecionar

// Página de listagem de escolas (HexaSchools)
// Exibe instituições do usuário, aplica tema azul e preto
export default async function SchoolsPage() {
  const session = await auth(); // Obtém sessão do usuário
  if (!session?.user?.id) redirect("/login?callbackUrl=/schools"); // Redireciona se não estiver logado

  const memberships = await listUserSchools(session.user.id); // Busca escolas do usuário

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">HexaSchools</h1>
          <p className="mt-2 text-slate-300">
            Ambiente institucional para escolas e faculdades.
          </p>
        </div>
        <Link
          href="/schools/new"
          className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8]"
          aria-label="Criar nova instituição"
        >
          Criar instituição
        </Link>
      </div>

      {memberships.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-[#334155] p-8 text-center">
          <p className="text-slate-400">Você ainda não participa de nenhuma instituição.</p>
          <Link
            href="/schools/new"
            className="mt-4 inline-block text-sm text-sky-300 hover:underline"
            aria-label="Criar a primeira instituição"
          >
            Criar a primeira instituição →
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.04]">
          {memberships.map((membership) => (
            <li key={membership.id}>
              <Link
                href={`/schools/${membership.schoolId}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-white/10"
                aria-label={`Ver escola ${membership.school.name}`}
              >
                <div>
                  <p className="font-medium text-white">{membership.school.name}</p>
                  <p className="text-sm text-slate-400">{membership.school.email}</p>
                </div>
                <span className="rounded-full bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-300">
                  {INSTITUTION_ROLE_LABELS[membership.institutionRole]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
