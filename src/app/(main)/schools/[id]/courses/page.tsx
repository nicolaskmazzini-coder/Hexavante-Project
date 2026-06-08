// Importações necessárias para a página de cursos da escola
import { auth } from "@/auth"; // Função para obter sessão do usuário
import { createSchoolCourseAction } from "@/app/actions/school"; // Action para criar curso institucional
import { SchoolForm } from "@/components/schools/school-form"; // Componente de formulário de escola
import { SchoolNav } from "@/components/schools/school-nav"; // Componente de navegação de escola
import { canManageAcademics } from "@/lib/school-permissions"; // Função para verificar permissão acadêmica
import { listApprovedCourses } from "@/services/course.service"; // Serviço para listar cursos aprovados
import {
  getSchoolMembership,
  listSchoolCourses,
} from "@/services/school.service"; // Serviços de escola
import Link from "next/link"; // Componente de link do Next.js
import { notFound, redirect } from "next/navigation"; // Funções de navegação

// Props da página de cursos
type Props = {
  params: Promise<{ id: string }> };

// Página de cursos institucionais da escola
// Permite criar e listar cursos institucionais, aplica tema azul e preto
export default async function SchoolCoursesPage({ params }: Props) {
  const { id } = await params; // Obtém ID da escola
  const session = await auth(); // Obtém sessão do usuário
  if (!session?.user?.id) redirect(`/login?callbackUrl=/schools/${id}/courses`); // Redireciona se não estiver logado

  const membership = await getSchoolMembership(session.user.id, id); // Busca membro da escola
  if (!membership) notFound(); // Retorna 404 se não for membro
  if (!canManageAcademics(membership.institutionRole)) {
    redirect(`/schools/${id}`); // Redireciona se não tiver permissão acadêmica
  }

  // Busca cursos da escola e cursos da plataforma em paralelo
  const [courses, platformCourses] = await Promise.all([
    listSchoolCourses(id),
    listApprovedCourses(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href={`/schools/${id}`} className="text-sm text-sky-300 hover:underline" aria-label={`Voltar para ${membership.school.name}`}>
        ← {membership.school.name}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Cursos institucionais</h1>

      <div className="mt-6">
        <SchoolNav schoolId={id} role={membership.institutionRole} active="courses" />
      </div>

      <div className="mt-8">
        <SchoolForm
          action={createSchoolCourseAction.bind(null, id)}
          submitLabel="Criar curso"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Título</label>
            <input
              name="title"
              required
              className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Descrição</label>
            <textarea
              name="description"
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Vincular curso da plataforma (opcional)
            </label>
            <select
              name="courseId"
              className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
            >
              <option value="">Sem vínculo</option>
              {platformCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-400">
              Alunos matriculados na turma serão inscritos automaticamente no curso vinculado.
            </p>
          </div>
        </SchoolForm>
      </div>

      {courses.length === 0 ? (
        <p className="mt-8 text-sm text-slate-400">Nenhum curso institucional ainda.</p>
      ) : (
        <ul className="mt-8 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.04]">
          {courses.map((course) => (
            <li key={course.id}>
              <Link
                href={`/schools/${id}/courses/${course.id}`}
                className="block px-4 py-4 hover:bg-white/10"
                aria-label={`Ver curso ${course.title}`}
              >
                <p className="font-medium text-white">{course.title}</p>
                {course.course && (
                  <p className="text-sm text-slate-400">
                    Vinculado: {course.course.title}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  {course._count.classes} turma(s)
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
