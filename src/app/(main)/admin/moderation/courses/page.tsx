import { auth } from "@/auth";
import { canModerate } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { listPendingCourses } from "@/services/moderation.service";
import { COURSE_STATUS_LABELS } from "@/lib/permissions";

export default async function CourseModerationPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/admin/moderation/courses");
  
  if (!canModerate(session.user.roles)) {
    redirect("/");
  }

  const courses = await listPendingCourses();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/admin/moderation" className="text-sm font-semibold text-sky-300 hover:text-sky-200">
        ← Voltar para moderação
      </Link>
      <h1 className="mt-4 text-3xl font-semibold text-sky-200">MODERAÇÃO DE CURSOS</h1>
      <p className="mt-2 text-slate-300">
        Aprove cursos criados por instrutores.
      </p>

      {courses.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-[#334155] p-10 text-center text-slate-400">
          Nenhum curso pendente de aprovação.
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {courses.map((course: any) => (
            <div
              key={course.id}
              className="bg-white/[0.04] border border-white/10 p-6 rounded-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{course.title}</h3>
                  <p className="text-sm text-slate-400">{course.category.name}</p>
                  <p className="mt-2 text-sm text-slate-300">{course.description}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Instrutor: {course.instructor.fullName || course.instructor.username}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Criado em {new Date(course.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/moderation/courses/${course.id}/approve`}
                    className="bg-[#2563eb] text-white px-4 py-2 text-sm font-semibold transition hover:bg-[#1d4ed8]"
                  >
                    Aprovar
                  </Link>
                  <Link
                    href={`/admin/moderation/courses/${course.id}/reject`}
                    className="bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700 transition-colors"
                  >
                    Rejeitar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
