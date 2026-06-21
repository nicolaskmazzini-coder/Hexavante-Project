import { auth } from "@/auth";
import { CourseModerationForm } from "@/components/moderation/course-moderation-form";
import { AppLink } from "@/components/ui/app-link";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { COURSE_STATUS_LABELS } from "@/lib/course-status";
import { canModerate } from "@/lib/permissions";
import { getCourseForModeration } from "@/services/moderation.service";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Shield } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function ModerateCourseDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/moderacao/cursos/${id}`);
  if (!canModerate(session.user.roles)) redirect("/");

  const course = await getCourseForModeration(id);
  if (!course) notFound();

  const instructorName = course.instructors[0]?.user.fullName ?? "—";

  return (
    <PageShell size="md">
      <AppLink href="/moderacao/conteudo" muted className="mb-4 inline-flex items-center gap-1">
        ← Conteúdo
      </AppLink>

      <PageHeader
        badge="Moderação"
        icon={Shield}
        title={course.title}
        description={`${course.category.name} · Instrutor: ${instructorName}`}
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <StatusBadge status={course.status} label={COURSE_STATUS_LABELS[course.status]} />
        {course.status === "APPROVED" && (
          <Link
            href={`/courses/${course.slug}`}
            className="text-sm font-semibold text-sky-400 hover:underline"
          >
            Ver curso publicado →
          </Link>
        )}
      </div>

      {course.shortDescription && <p className="mt-4 text-slate-300">{course.shortDescription}</p>}
      {course.description && (
        <Card padding="md" className="mt-4 whitespace-pre-wrap text-sm text-slate-300">
          {course.description}
        </Card>
      )}

      <div className="mt-6">
        <h2 className="font-semibold text-white">Conteúdo ({course.modules.length} módulos)</h2>
        <ul className="mt-3 space-y-3">
          {course.modules.map((mod) => (
            <Card key={mod.id} padding="sm" className="text-sm">
              <p className="font-medium text-white">
                {mod.orderNumber}. {mod.title}
              </p>
              <ul className="mt-1 pl-4 text-slate-400">
                {mod.lessons.map((lesson) => (
                  <li key={lesson.id}>Aula: {lesson.title}</li>
                ))}
                {mod.materials.map((material) => (
                  <li key={material.id}>Material: {material.title}</li>
                ))}
              </ul>
            </Card>
          ))}
        </ul>
      </div>

      {course.moderations.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold text-white">Histórico de moderação</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {course.moderations.map((entry) => (
              <li key={entry.id} className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                <span className="font-medium text-slate-200">
                  {COURSE_STATUS_LABELS[entry.status]}
                </span>{" "}
                · {entry.moderator.fullName} ·{" "}
                {entry.reviewedAt.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
                {entry.reviewNotes && (
                  <p className="mt-1 text-slate-500">{entry.reviewNotes}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <CourseModerationForm
          courseId={course.id}
          currentStatus={course.status}
          returnTo="/moderacao/conteudo"
        />
      </div>
    </PageShell>
  );
}
