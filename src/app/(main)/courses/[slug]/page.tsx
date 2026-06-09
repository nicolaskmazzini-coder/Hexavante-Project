import { auth } from "@/auth";
import { enrollAction } from "@/app/actions/enrollment";
import { getApprovedCourseBySlug } from "@/services/course.service";
import { getEnrollment } from "@/services/enrollment.service";
import { countTotalLessons } from "@/services/course.service";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  const course = await getApprovedCourseBySlug(slug);

  if (!course) notFound();

  const enrollment = session?.user?.id
    ? await getEnrollment(session.user.id, course.id)
    : null;

  const totalLessons = countTotalLessons(course.modules);

  return (
    <PageShell size="md">
      <Badge variant="sky" className="mb-2">
        {course.category.name}
      </Badge>
      <h1 className="hx-page-title">{course.title}</h1>
      {course.shortDescription && (
        <p className="mt-3 text-lg text-slate-300">{course.shortDescription}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
        <span>{course.modules.length} módulos</span>
        <span>{totalLessons} aulas</span>
        <span>Gratuito</span>
        <span>
          Nível:{" "}
          {course.level === "BEGINNER"
            ? "Iniciante"
            : course.level === "INTERMEDIATE"
              ? "Intermediário"
              : "Avançado"}
        </span>
        {course.estimatedHours != null && course.estimatedHours > 0 && (
          <span>{course.estimatedHours}h estimadas</span>
        )}
        {course.instructors[0] && (
          <span>Instrutor: {course.instructors[0].user.fullName}</span>
        )}
      </div>

      {course.description && (
        <Card padding="lg" className="mt-8">
          <h2 className="font-semibold text-white">Sobre o curso</h2>
          <p className="mt-2 whitespace-pre-wrap text-slate-300">{course.description}</p>
        </Card>
      )}

      <Card padding="lg" className="mt-8">
        <h2 className="font-semibold text-white">Conteúdo</h2>
        <ul className="mt-4 space-y-4">
          {course.modules.map((mod) => (
            <li key={mod.id}>
              <p className="font-medium text-slate-200">
                {mod.orderNumber}. {mod.title}
              </p>
              <ul className="mt-2 space-y-1 pl-4 text-sm text-slate-400">
                {mod.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    Aula {lesson.orderNumber}: {lesson.title}
                  </li>
                ))}
                {mod.materials.map((mat) => (
                  <li key={mat.id} className="text-sky-300">
                    PDF: {mat.title}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-8">
        {enrollment ? (
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-sm text-slate-400">
              Progresso: <strong className="text-white">{Math.round(enrollment.progress)}%</strong>
            </div>
            <LinkButton href={`/courses/${slug}/learn`} aria-label="Continuar estudando">
              Continuar estudando
            </LinkButton>
          </div>
        ) : session?.user ? (
          <form action={enrollAction.bind(null, course.id, slug)}>
            <Button type="submit">Matricular-se no curso</Button>
          </form>
        ) : (
          <LinkButton
            href={`/login?callbackUrl=/courses/${slug}`}
            aria-label="Entrar para se matricular"
          >
            Entrar para se matricular
          </LinkButton>
        )}
      </div>
    </PageShell>
  );
}
