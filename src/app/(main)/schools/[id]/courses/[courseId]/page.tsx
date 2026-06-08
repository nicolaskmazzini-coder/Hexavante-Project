// Importações necessárias para a página de detalhes do curso institucional
import { auth } from "@/auth"; // Função para obter sessão do usuário
import { createSchoolClassAction } from "@/app/actions/school"; // Action para criar turma
import { SchoolForm } from "@/components/schools/school-form"; // Componente de formulário de escola
import { canManageAcademics } from "@/lib/school-permissions"; // Função para verificar permissão acadêmica
import { getSchoolCourse, getSchoolMembership } from "@/services/school.service"; // Serviços de escola
import Link from "next/link"; // Componente de link do Next.js
import { notFound, redirect } from "next/navigation"; // Funções de navegação

// Props da página de curso
type Props = {
  params: Promise<{ id: string; courseId: string }> };

// Página de detalhes do curso institucional
// Permite criar turmas e listar turmas existentes, aplica tema azul e preto
export default async function SchoolCourseDetailPage({ params }: Props) {
  const { id, courseId } = await params; // Obtém IDs da escola e curso
  const session = await auth(); // Obtém sessão do usuário
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/schools/${id}/courses/${courseId}`); // Redireciona se não estiver logado
  }

  const membership = await getSchoolMembership(session.user.id, id); // Busca membro da escola
  if (!membership) notFound(); // Retorna 404 se não for membro
  if (!canManageAcademics(membership.institutionRole)) {
    redirect(`/schools/${id}`); // Redireciona se não tiver permissão acadêmica
  }

  const course = await getSchoolCourse(id, courseId); // Busca curso institucional
  if (!course) notFound(); // Retorna 404 se não encontrar curso

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href={`/schools/${id}/courses`}
        className="text-sm text-sky-300 hover:underline"
        aria-label="Voltar para cursos"
      >
        ← Cursos
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">{course.title}</h1>
      {course.description && (
        <p className="mt-2 text-slate-300">{course.description}</p>
      )}
      {course.course && (
        <p className="mt-2 text-sm text-sky-300">
          Curso da plataforma: {course.course.title}
        </p>
      )}

      <div className="mt-8">
        <SchoolForm
          action={createSchoolClassAction.bind(null, id, courseId)}
          submitLabel="Criar turma"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Nome da turma</label>
              <input
                name="name"
                required
                className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
                placeholder="Ex.: Turma A"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Semestre (opcional)</label>
              <input
                name="semester"
                className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
                placeholder="Ex.: 2025.1"
              />
            </div>
          </div>
        </SchoolForm>
      </div>

      <h2 className="mt-10 font-semibold text-white">Turmas</h2>
      {course.classes.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">Nenhuma turma criada ainda.</p>
      ) : (
        <ul className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.04]">
          {course.classes.map((cls) => (
            <li key={cls.id}>
              <Link
                href={`/schools/${id}/classes/${cls.id}`}
                className="flex items-center justify-between px-4 py-4 hover:bg-white/10"
                aria-label={`Ver turma ${cls.name}`}
              >
                <div>
                  <p className="font-medium text-white">{cls.name}</p>
                  {cls.semester && (
                    <p className="text-sm text-slate-400">{cls.semester}</p>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {cls._count.enrollments} aluno(s) · {cls._count.teachers} prof.
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
