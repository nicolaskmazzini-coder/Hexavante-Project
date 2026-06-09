import { auth } from "@/auth";
import { CertificateButton } from "@/components/courses/certificate-button";
import { CompleteLessonButton } from "@/components/courses/complete-lesson-button";
import { CourseProgressBar } from "@/components/courses/course-progress-bar";
import { LessonSidebar } from "@/components/courses/lesson-sidebar";
import { VideoPlayer } from "@/components/courses/video-player";
import { AppLink } from "@/components/ui/app-link";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLessonWithAccess } from "@/services/enrollment.service";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string; lessonId: string }>;
};

export default async function LessonPage({ params }: Props) {
  const { slug, lessonId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/courses/${slug}/learn/${lessonId}`);

  let data;
  try {
    data = await getLessonWithAccess(session.user.id, slug, lessonId);
  } catch (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="rounded-lg bg-amber-900/20 p-4 text-amber-400">
          {error instanceof Error ? error.message : "Acesso negado."}
        </p>
        <AppLink href={`/courses/${slug}`} className="mt-4 inline-block">
          Voltar ao curso
        </AppLink>
      </div>
    );
  }

  if (!data) notFound();

  const { course, enrollment, lesson, module, allLessons, progresses } = data;
  const completedIds = new Set(
    progresses.filter((p) => p.completed).map((p) => p.lessonId),
  );
  const isCompleted = completedIds.has(lesson.id);

  const sidebarLessons = allLessons.map((l) => {
    const mod = course.modules.find((m) => m.id === l.moduleId)!;
    return {
      id: l.id,
      title: l.title,
      orderNumber: l.orderNumber,
      moduleId: l.moduleId,
      moduleOrder: mod.orderNumber,
      moduleTitle: mod.title,
    };
  });

  const nextLesson = allLessons[data.lessonIndex + 1];

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[280px_1fr]">
      <div>
        <AppLink href={`/courses/${slug}`} className="mb-4 inline-block text-sm">
          ← {course.title}
        </AppLink>
        <Card padding="sm" className="mb-4">
          <CourseProgressBar progress={enrollment.progress} />
        </Card>
        <LessonSidebar
          courseSlug={slug}
          lessons={sidebarLessons}
          currentLessonId={lessonId}
          completedLessonIds={completedIds}
          progressionType={course.progressionType}
        />
        <div className="mt-4">
          <CertificateButton courseId={course.id} progress={enrollment.progress} />
        </div>
      </div>

      <div>
        <p className="text-sm text-slate-400">
          Módulo {module?.orderNumber}: {module?.title}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white">{lesson.title}</h1>
        {lesson.description && (
          <p className="mt-2 text-slate-300">{lesson.description}</p>
        )}

        {lesson.videoUrl && (
          <div className="mt-6">
            <VideoPlayer url={lesson.videoUrl} provider={lesson.videoProvider} />
          </div>
        )}

        {module && module.materials.length > 0 && (
          <Card padding="md" className="mt-6">
            <h3 className="font-semibold text-white">Materiais</h3>
            <ul className="mt-2 space-y-2">
              {module.materials.map((mat) => (
                <li key={mat.id}>
                  <a
                    href={mat.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-sky-300 hover:underline"
                  >
                    {mat.title} ({mat.fileType.toUpperCase()})
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <CompleteLessonButton
            courseSlug={slug}
            lessonId={lesson.id}
            courseId={course.id}
            completed={isCompleted}
          />
          {nextLesson && isCompleted && (
            <LinkButton
              href={`/courses/${slug}/learn/${nextLesson.id}`}
              variant="outline"
              size="sm"
              aria-label="Próxima aula"
            >
              Próxima aula →
            </LinkButton>
          )}
        </div>
      </div>
    </div>
  );
}
