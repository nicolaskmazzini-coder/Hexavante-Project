// Importações necessárias para a página de cursos do instrutor
import { auth } from "@/auth"; // Função para obter sessão do usuário
import { StatusBadge } from "@/components/ui/status-badge"; // Componente de badge de status
import {
  APPLICATION_STATUS_LABELS,
  COURSE_STATUS_LABELS,
  isInstructor,
} from "@/lib/permissions"; // Funções de permissão e labels
import { getLatestInstructorApplication } from "@/services/moderation.service"; // Serviço para obter aplicação de instrutor
import { listInstructorCourses } from "@/services/course.service"; // Serviço para listar cursos do instrutor
import Link from "next/link"; // Componente de link do Next.js
import { redirect } from "next/navigation"; // Função para redirecionar

// Página de cursos do instrutor
// Exibe cursos criados pelo instrutor ou solicitação para se tornar instrutor, aplica tema azul e preto
export default async function InstructorCoursesPage() {
  const session = await auth(); // Obtém sessão do usuário
  if (!session?.user?.id) redirect("/login?callbackUrl=/instructor/courses"); // Redireciona se não estiver logado

  if (!isInstructor(session.user.roles)) {
    const application = await getLatestInstructorApplication(session.user.id); // Busca aplicação de instrutor

    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-bold text-white">Área do instrutor</h1>
        <p className="mt-4 text-slate-300">
          Para criar cursos na Hexavante, você precisa ser aprovado como instrutor.
        </p>

        {application?.status === "PENDING" ? (
          <div className="mt-6 rounded-xl border border-amber-900/50 bg-amber-900/10 p-4">
            <StatusBadge status="PENDING" label={APPLICATION_STATUS_LABELS.PENDING} />
            <p className="mt-2 text-sm text-slate-300">Solicitação em análise pelo moderador.</p>
          </div>
        ) : (
          <Link
            href="/instructor/apply"
            className="mt-6 inline-block rounded-lg bg-[#2563eb] px-5 py-2.5 font-medium text-white hover:bg-[#1d4ed8]"
            aria-label="Solicitar perfil de instrutor"
          >
            Solicitar perfil de instrutor
          </Link>
        )}
      </div>
    );
  }

  const courses = await listInstructorCourses(session.user.id); // Busca cursos do instrutor

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Meus cursos</h1>
          <p className="mt-2 text-slate-300">
            Cursos novos ficam pendentes até aprovação de um moderador.
          </p>
        </div>
        <Link
          href="/instructor/courses/new"
          className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8]"
          aria-label="Criar novo curso"
        >
          Novo curso
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#334155] p-10 text-center">
          <p className="text-slate-400">Você ainda não criou nenhum curso.</p>
          <Link href="/instructor/courses/new" className="mt-4 inline-block text-sky-300 hover:underline" aria-label="Criar primeiro curso">
            Criar primeiro curso
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/instructor/courses/${course.id}/edit`}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-4 hover:border-sky-400/35"
              aria-label={`Editar curso ${course.title}`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{course.title}</h3>
                  <StatusBadge
                    status={course.status}
                    label={COURSE_STATUS_LABELS[course.status] ?? course.status}
                  />
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {course.category.name} · {course._count.modules} módulos ·{" "}
                  {course._count.enrollments} alunos
                </p>
              </div>
              <span className="text-sm text-sky-300">Editar →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
