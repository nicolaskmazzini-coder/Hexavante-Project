// Importações necessárias para a página de detalhes da turma
import { auth } from "@/auth"; // Função para obter sessão do usuário
import {
  assignTeacherAction,
  enrollStudentAction,
} from "@/app/actions/school"; // Actions para gerenciar turma
import { SchoolForm } from "@/components/schools/school-form"; // Componente de formulário de escola
import {
  canAssignTeachers,
  canManageAcademics,
} from "@/lib/school-permissions"; // Funções de permissão
import {
  getSchoolClass,
  getSchoolMembership,
  getSchoolStudents,
  getSchoolTeachers,
} from "@/services/school.service"; // Serviços de escola
import Link from "next/link"; // Componente de link do Next.js
import { notFound, redirect } from "next/navigation"; // Funções de navegação

// Props da página de turma
type Props = {
  params: Promise<{ id: string; classId: string }> };

// Página de detalhes da turma da escola
// Permite matricular alunos e atribuir professores, aplica tema azul e preto
export default async function SchoolClassDetailPage({ params }: Props) {
  const { id, classId } = await params; // Obtém IDs da escola e turma
  const session = await auth(); // Obtém sessão do usuário
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/schools/${id}/classes/${classId}`); // Redireciona se não estiver logado
  }

  const membership = await getSchoolMembership(session.user.id, id); // Busca membro da escola
  if (!membership) notFound(); // Retorna 404 se não for membro

  const schoolClass = await getSchoolClass(id, classId); // Busca turma
  if (!schoolClass) notFound(); // Retorna 404 se não encontrar turma

  const role = membership.institutionRole;
  // Verifica se pode gerenciar (acadêmico ou professor da turma)
  const canManage =
    canManageAcademics(role) ||
    (role === "TEACHER" &&
      schoolClass.teachers.some((t) => t.userId === session.user.id));

  if (!canManage && role !== "STUDENT") {
    redirect(`/schools/${id}`); // Redireciona se não tiver permissão
  }

  const enrolledIds = new Set(schoolClass.enrollments.map((e) => e.userId)); // Conjunto de IDs de alunos matriculados
  const assignedTeacherIds = new Set(schoolClass.teachers.map((t) => t.userId)); // Conjunto de IDs de professores atribuídos

  // Busca alunos e professores se tiver permissão acadêmica
  const [students, teachers] = canManageAcademics(role)
    ? await Promise.all([getSchoolStudents(id), getSchoolTeachers(id)])
    : [[], []];

  const availableStudents = students.filter((s) => !enrolledIds.has(s.userId)); // Alunos disponíveis para matrícula
  const availableTeachers = teachers.filter((t) => !assignedTeacherIds.has(t.userId)); // Professores disponíveis para atribuição

  const platformCourse = schoolClass.schoolCourse.course; // Curso da plataforma vinculado

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href={`/schools/${id}/courses/${schoolClass.schoolCourseId}`}
        className="text-sm text-sky-300 hover:underline"
        aria-label={`Voltar para ${schoolClass.schoolCourse.title}`}
      >
        ← {schoolClass.schoolCourse.title}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">{schoolClass.name}</h1>
      {schoolClass.semester && (
        <p className="text-sm text-slate-400">Semestre: {schoolClass.semester}</p>
      )}

      {canManageAcademics(role) && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <SchoolForm
            action={enrollStudentAction.bind(null, id, classId)}
            submitLabel="Matricular aluno"
          >
            <label className="mb-1 block text-sm font-medium text-slate-300">Aluno</label>
            <select
              name="userId"
              required
              className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
            >
              <option value="">Selecione...</option>
              {availableStudents.map((s) => (
                <option key={s.userId} value={s.userId}>
                  {s.user.fullName} (@{s.user.username})
                </option>
              ))}
            </select>
            {availableStudents.length === 0 && (
              <p className="text-xs text-slate-400">
                Adicione alunos em Membros ou todos já estão matriculados.
              </p>
            )}
          </SchoolForm>

          {canAssignTeachers(role) && (
            <SchoolForm
              action={assignTeacherAction.bind(null, id, classId)}
              submitLabel="Atribuir professor"
            >
              <label className="mb-1 block text-sm font-medium text-slate-300">Professor</label>
              <select
                name="userId"
                required
                className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
              >
                <option value="">Selecione...</option>
                {availableTeachers.map((t) => (
                  <option key={t.userId} value={t.userId}>
                    {t.user.fullName} (@{t.user.username})
                  </option>
                ))}
              </select>
            </SchoolForm>
          )}
        </div>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="font-semibold text-white">
            Alunos ({schoolClass.enrollments.length})
          </h2>
          {schoolClass.enrollments.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">Nenhum aluno matriculado.</p>
          ) : (
            <ul className="mt-3 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.04]">
              {schoolClass.enrollments.map((enrollment) => (
                <li key={enrollment.id} className="px-4 py-3">
                  <p className="font-medium text-white">{enrollment.user.fullName}</p>
                  <p className="text-sm text-slate-400">@{enrollment.user.username}</p>
                  {platformCourse?.slug &&
                    enrollment.userId === session.user.id && (
                      <Link
                        href={`/courses/${platformCourse.slug}/learn`}
                        className="mt-1 inline-block text-sm text-sky-300 hover:underline"
                        aria-label="Estudar curso"
                      >
                        Estudar curso →
                      </Link>
                    )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-semibold text-white">
            Professores ({schoolClass.teachers.length})
          </h2>
          {schoolClass.teachers.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">Nenhum professor atribuído.</p>
          ) : (
            <ul className="mt-3 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.04]">
              {schoolClass.teachers.map((teacher) => (
                <li key={teacher.id} className="px-4 py-3">
                  <p className="font-medium text-white">{teacher.user.fullName}</p>
                  <p className="text-sm text-slate-400">@{teacher.user.username}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
