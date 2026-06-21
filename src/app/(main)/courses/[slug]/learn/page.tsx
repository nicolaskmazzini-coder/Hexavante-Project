import { auth } from "@/auth";
import { getCourseBySlug } from "@/services/course.service";
import { getEnrollment } from "@/services/enrollment.service";
import { getResumeLessonId } from "@/services/study-continuation.service";
import { notFound, redirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export default async function LearnIndexPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/courses/${slug}/learn`);

  const course = await getCourseBySlug(slug);
  if (!course || course.status !== "APPROVED") notFound();

  const enrollment = await getEnrollment(session.user.id, course.id);
  if (!enrollment) redirect(`/courses/${slug}`);

  const resumeLessonId = await getResumeLessonId(session.user.id, slug);
  const firstLesson = course.modules.flatMap((m) => m.lessons)[0];

  if (!firstLesson && !resumeLessonId) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center text-slate-500">
        Este curso ainda não possui aulas.
      </div>
    );
  }

  redirect(`/courses/${slug}/learn/${resumeLessonId ?? firstLesson!.id}`);
}
