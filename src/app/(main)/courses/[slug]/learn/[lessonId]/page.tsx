// Importações necessárias para a página de aula
import { auth } from "@/auth"; // Função para obter sessão do usuário
import { CompleteLessonButton } from "@/components/courses/complete-lesson-button"; // Componente de botão para concluir aula
import { LessonSidebar } from "@/components/courses/lesson-sidebar"; // Componente de barra lateral de aulas
import { VideoPlayer } from "@/components/courses/video-player"; // Componente de player de vídeo
import { getLessonWithAccess } from "@/services/enrollment.service"; // Serviço para obter aula com verificação de acesso
import Link from "next/link"; // Componente de link do Next.js
import { notFound, redirect } from "next/navigation"; // Funções de navegação

// Props da página de aula
type Props = {
  params: Promise<{ slug: string; lessonId: string }> };

// Página de visualização de aula
// Exibe vídeo, materiais e botão para concluir, aplica tema azul e preto
export default async function LessonPage({ params }: Props) {
  const { slug, lessonId } = await params; // Obtém slug do curso e ID da aula
  const session = await auth(); // Obtém sessão do usuário
  if (!session?.user?.id) redirect(`/login?callbackUrl=/courses/${slug}/learn/${lessonId}`); // Redireciona se não estiver logado

  let data;
  try {
    data = await getLessonWithAccess(session.user.id, slug, lessonId); // Busca aula com verificação de acesso
  } catch (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="rounded-lg bg-amber-900/20 p-4 text-amber-400">
          {error instanceof Error ? error.message : "Acesso negado."}
        </p>
        <Link href={`/courses/${slug}`} className="mt-4 inline-block text-sky-300" aria-label="Voltar ao curso">
          Voltar ao curso
        </Link>
      </div>
    );
  }

  if (!data) notFound(); // Retorna 404 se não encontrar aula

  const { course, enrollment, lesson, module, allLessons, progresses } = data;
  const completedIds = new Set(
    progresses.filter((p) => p.completed).map((p) => p.lessonId), // Cria conjunto de IDs de aulas concluídas
  );
  const isCompleted = completedIds.has(lesson.id); // Verifica se a aula atual está concluída

  // Mapeia aulas para formato da barra lateral
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

  const nextLesson = allLessons[data.lessonIndex + 1]; // Obtém próxima aula

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[280px_1fr]">
      <div>
        <Link
          href={`/courses/${slug}`}
          className="mb-4 inline-block text-sm text-sky-300 hover:underline"
          aria-label={`Voltar para ${course.title}`}
        >
          ← {course.title}
        </Link>
        <p className="mb-2 text-xs text-slate-400">
          Progresso: {Math.round(enrollment.progress)}%
        </p>
        <LessonSidebar
          courseSlug={slug}
          lessons={sidebarLessons}
          currentLessonId={lessonId}
          completedLessonIds={completedIds}
          progressionType={course.progressionType}
        />
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
          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-4">
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
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <CompleteLessonButton
            courseSlug={slug}
            lessonId={lesson.id}
            courseId={course.id}
            completed={isCompleted}
          />
          {nextLesson && isCompleted && (
            <Link
              href={`/courses/${slug}/learn/${nextLesson.id}`}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium hover:bg-white/10 text-slate-300"
              aria-label="Próxima aula"
            >
              Próxima aula →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
