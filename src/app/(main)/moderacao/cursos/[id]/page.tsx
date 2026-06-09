import { auth } from "@/auth";
import { CourseModerationForm } from "@/components/moderation/course-moderation-form";
import { AppLink } from "@/components/ui/app-link";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { canModerate } from "@/lib/permissions";
import { getCourseForModeration } from "@/services/moderation.service";
import { notFound, redirect } from "next/navigation";
import { Shield } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function ModerateCourseDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/moderacao/cursos/${id}`);
  if (!canModerate(session.user.roles)) redirect("/");

  const course = await getCourseForModeration(id);
  if (!course || course.status !== "PENDING_REVIEW") notFound();

  return (
    <PageShell size="md">
      <AppLink href="/moderacao/cursos" muted className="mb-4 inline-flex items-center gap-1">
        ← Cursos pendentes
      </AppLink>

      <PageHeader
        badge="Moderação"
        icon={Shield}
        title={course.title}
        description={`${course.category.name} · Instrutor: ${course.instructors[0]?.user.fullName}`}
      />

      {course.shortDescription && <p className="text-slate-300">{course.shortDescription}</p>}
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
                {mod.lessons.map((l) => (
                  <li key={l.id}>Aula: {l.title}</li>
                ))}
                {mod.materials.map((m) => (
                  <li key={m.id}>Material: {m.title}</li>
                ))}
              </ul>
            </Card>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <CourseModerationForm courseId={course.id} />
      </div>
    </PageShell>
  );
}
