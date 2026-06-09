import { auth } from "@/auth";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppLink } from "@/components/ui/app-link";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { Alert } from "@/components/ui/alert";
import {
  APPLICATION_STATUS_LABELS,
  COURSE_STATUS_LABELS,
  isInstructor,
} from "@/lib/permissions";
import { getLatestInstructorApplication } from "@/services/moderation.service";
import { listInstructorCourses } from "@/services/course.service";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, GraduationCap } from "lucide-react";

export default async function InstructorCoursesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/instructor/courses");

  if (!isInstructor(session.user.roles)) {
    const application = await getLatestInstructorApplication(session.user.id);

    return (
      <PageShell size="md">
        <PageHeader
          badge="Instrutor"
          icon={GraduationCap}
          title="Área do instrutor"
          description="Para criar cursos na Hexavante, você precisa ser aprovado como instrutor."
        />

        {application?.status === "PENDING" ? (
          <Alert variant="warning">
            <StatusBadge status="PENDING" label={APPLICATION_STATUS_LABELS.PENDING} />
            <p className="mt-2">Solicitação em análise pelo moderador.</p>
          </Alert>
        ) : (
          <LinkButton href="/instructor/apply" aria-label="Solicitar perfil de instrutor">
            Solicitar perfil de instrutor
          </LinkButton>
        )}
      </PageShell>
    );
  }

  const courses = await listInstructorCourses(session.user.id);

  return (
    <PageShell>
      <PageHeader
        badge="Instrutor"
        icon={BookOpen}
        title="Meus cursos"
        description="Cursos novos ficam pendentes até aprovação de um moderador."
        action={
          <LinkButton href="/instructor/courses/new" size="sm" aria-label="Criar novo curso">
            Novo curso
          </LinkButton>
        }
      />

      {courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="Você ainda não criou nenhum curso.">
          <AppLink href="/instructor/courses/new" className="mt-4 inline-block">
            Criar primeiro curso
          </AppLink>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/instructor/courses/${course.id}/edit`}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-sky-400/35 hover:bg-white/[0.06]"
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
    </PageShell>
  );
}
