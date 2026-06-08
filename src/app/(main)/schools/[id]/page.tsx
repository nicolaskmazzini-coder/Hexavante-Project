// Importações necessárias para a página de dashboard da escola
import { auth } from "@/auth"; // Função para obter sessão do usuário
import { SchoolNav } from "@/components/schools/school-nav"; // Componente de navegação de escola
import {
  canManageAcademics,
  canManageSchool,
} from "@/lib/school-permissions"; // Funções de permissão
import {
  getSchoolDashboard,
  getSchoolMembership,
  listStudentClasses,
  listTeacherClasses,
} from "@/services/school.service"; // Serviços de escola
import Link from "next/link"; // Componente de link do Next.js
import { notFound, redirect } from "next/navigation"; // Funções de navegação

// Props da página de dashboard
type Props = {
  params: Promise<{ id: string }>;
};

// Página de dashboard da escola
// Exibe estatísticas, turmas e opções baseadas no papel, aplica tema azul e preto
export default async function SchoolDashboardPage({ params }: Props) {
  const { id } = await params; // Obtém ID da escola
  const session = await auth(); // Obtém sessão do usuário
  if (!session?.user?.id) redirect(`/login?callbackUrl=/schools/${id}`); // Redireciona se não estiver logado

  const membership = await getSchoolMembership(session.user.id, id); // Busca membro da escola
  if (!membership) notFound(); // Retorna 404 se não for membro

  const role = membership.institutionRole; // Obtém papel do usuário
  const stats = await getSchoolDashboard(id); // Busca estatísticas da escola

  // Busca turmas do aluno e professor em paralelo
  const [studentClasses, teacherClasses] = await Promise.all([
    role === "STUDENT" ? listStudentClasses(session.user.id, id) : Promise.resolve([]),
    role === "TEACHER" ? listTeacherClasses(session.user.id, id) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/schools" className="text-sm text-sky-300 hover:underline" aria-label="Voltar para HexaSchools">
        ← HexaSchools
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-white">{membership.school.name}</h1>
      <p className="mt-1 text-slate-300">{membership.school.email}</p>

      <div className="mt-6">
        <SchoolNav schoolId={id} role={role} active="dashboard" />
      </div>

      {(canManageSchool(role) || canManageAcademics(role)) && (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-2xl font-bold text-sky-300">{stats.memberCount}</p>
            <p className="text-sm text-slate-400">Membros</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-2xl font-bold text-sky-300">{stats.courseCount}</p>
            <p className="text-sm text-slate-400">Cursos institucionais</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-2xl font-bold text-sky-300">{stats.classCount}</p>
            <p className="text-sm text-slate-400">Turmas</p>
          </div>
        </div>
      )}

      {role === "STUDENT" && (
        <section className="mt-8">
          <h2 className="font-semibold text-white">Minhas turmas</h2>
          {studentClasses.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              Você ainda não está matriculado em nenhuma turma.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {studentClasses.map((enrollment) => {
                const cls = enrollment.schoolClass;
                const platformCourse = cls.schoolCourse.course;
                return (
                  <li
                    key={enrollment.id}
                    className="rounded-xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <p className="font-medium text-white">{cls.name}</p>
                    <p className="text-sm text-slate-400">{cls.schoolCourse.title}</p>
                    {cls.semester && (
                      <p className="text-xs text-slate-500">Semestre: {cls.semester}</p>
                    )}
                    {platformCourse?.slug && (
                      <Link
                        href={`/courses/${platformCourse.slug}/learn`}
                        className="mt-2 inline-block text-sm text-sky-300 hover:underline"
                        aria-label="Acessar conteúdo do curso"
                      >
                        Acessar conteúdo do curso →
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {role === "TEACHER" && (
        <section className="mt-8">
          <h2 className="font-semibold text-white">Turmas que leciono</h2>
          {teacherClasses.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              Nenhuma turma atribuída a você ainda.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {teacherClasses.map((assignment) => {
                const cls = assignment.schoolClass;
                return (
                  <li key={assignment.id}>
                    <Link
                      href={`/schools/${id}/classes/${cls.id}`}
                      className="block rounded-xl border border-white/10 bg-white/[0.04] p-4 hover:border-sky-400/35"
                      aria-label={`Ver turma ${cls.name}`}
                    >
                      <p className="font-medium text-white">{cls.name}</p>
                      <p className="text-sm text-slate-400">{cls.schoolCourse.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {cls._count.enrollments} aluno(s)
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {canManageAcademics(role) && (
        <div className="mt-8">
          <Link
            href={`/schools/${id}/courses`}
            className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8]"
            aria-label="Gerenciar cursos"
          >
            Gerenciar cursos
          </Link>
        </div>
      )}
    </div>
  );
}
