// Importações necessárias para a página de membros da escola
import { auth } from "@/auth"; // Função para obter sessão do usuário
import { addMemberAction, removeMemberAction } from "@/app/actions/school"; // Actions para gerenciar membros
import { SchoolForm } from "@/components/schools/school-form"; // Componente de formulário de escola
import { SchoolNav } from "@/components/schools/school-nav"; // Componente de navegação de escola
import {
  ASSIGNABLE_ROLES,
  canManageSchool,
  INSTITUTION_ROLE_LABELS,
} from "@/lib/school-permissions"; // Funções de permissão e labels
import { getSchoolMembership, listSchoolMembers } from "@/services/school.service"; // Serviços de escola
import Link from "next/link"; // Componente de link do Next.js
import { notFound, redirect } from "next/navigation"; // Funções de navegação

// Props da página de membros
type Props = {
  params: Promise<{ id: string }> };

// Página de gerenciamento de membros da escola
// Permite adicionar e remover membros, aplica tema azul e preto
export default async function SchoolMembersPage({ params }: Props) {
  const { id } = await params; // Obtém ID da escola
  const session = await auth(); // Obtém sessão do usuário
  if (!session?.user?.id) redirect(`/login?callbackUrl=/schools/${id}/members`); // Redireciona se não estiver logado

  const membership = await getSchoolMembership(session.user.id, id); // Busca membro da escola
  if (!membership) notFound(); // Retorna 404 se não for membro
  if (!canManageSchool(membership.institutionRole)) {
    redirect(`/schools/${id}`); // Redireciona se não tiver permissão
  }

  const members = await listSchoolMembers(id); // Busca membros da escola

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href={`/schools/${id}`} className="text-sm text-sky-300 hover:underline" aria-label={`Voltar para ${membership.school.name}`}>
        ← {membership.school.name}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Membros</h1>

      <div className="mt-6">
        <SchoolNav schoolId={id} role={membership.institutionRole} active="members" />
      </div>

      <div className="mt-8">
        <SchoolForm
          action={addMemberAction.bind(null, id)}
          submitLabel="Adicionar membro"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">E-mail do usuário</label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
                placeholder="usuario@email.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Papel institucional</label>
              <select
                name="institutionRole"
                required
                className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
              >
                {ASSIGNABLE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {INSTITUTION_ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            O usuário precisa já ter conta cadastrada na plataforma Hexavante.
          </p>
        </SchoolForm>
      </div>

      <ul className="mt-8 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.04]">
        {members.map((member) => (
          <li
            key={member.id}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
          >
            <div>
              <p className="font-medium text-white">{member.user.fullName}</p>
              <p className="text-sm text-slate-400">
                @{member.user.username} · {member.user.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300">
                {INSTITUTION_ROLE_LABELS[member.institutionRole]}
              </span>
              {member.institutionRole !== "DIRECTOR" &&
                member.userId !== session.user.id && (
                  <form action={removeMemberAction.bind(null, id, member.id)}>
                    <button
                      type="submit"
                      className="text-xs text-red-400 hover:underline"
                    >
                      Remover
                    </button>
                  </form>
                )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
