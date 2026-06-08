import { auth } from "@/auth";
import { CourseModerationForm } from "@/components/moderation/course-moderation-form";
import { canModerate } from "@/lib/permissions";
import { getCourseForModeration } from "@/services/moderation.service";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function ModerateCourseDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/moderacao/cursos/${id}`);
  if (!canModerate(session.user.roles)) redirect("/");

  const course = await getCourseForModeration(id);
  if (!course || course.status !== "PENDING_REVIEW") notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/moderacao/cursos" className="text-sm text-indigo-600 hover:underline">
        ← Cursos pendentes
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-slate-900">{course.title}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {course.category.name} · Instrutor: {course.instructors[0]?.user.fullName}
      </p>

      {course.shortDescription && (
        <p className="mt-4 text-slate-600">{course.shortDescription}</p>
      )}
      {course.description && (
        <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap">
          {course.description}
        </div>
      )}

      <div className="mt-6">
        <h2 className="font-semibold text-slate-900">Conteúdo ({course.modules.length} módulos)</h2>
        <ul className="mt-3 space-y-3">
          {course.modules.map((mod) => (
            <li key={mod.id} className="rounded-lg border border-slate-200 p-3 text-sm">
              <p className="font-medium">{mod.orderNumber}. {mod.title}</p>
              <ul className="mt-1 pl-4 text-slate-600">
                {mod.lessons.map((l) => (
                  <li key={l.id}>Aula: {l.title}</li>
                ))}
                {mod.materials.map((m) => (
                  <li key={m.id}>Material: {m.title}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <CourseModerationForm courseId={course.id} />
      </div>
    </div>
  );
}
