import { auth } from "@/auth";
import { startExamAction } from "@/app/actions/exam";
import { AppLink } from "@/components/ui/app-link";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";
import { EXAM_TYPE_LABELS } from "@/lib/validations/exam";
import { getExamBySlug } from "@/services/exam.service";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export default async function ExamDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  const exam = await getExamBySlug(slug);

  if (!exam || !exam.isPublished) notFound();

  return (
    <PageShell size="md">
      <AppLink href="/simulados" muted className="mb-4 inline-flex items-center gap-1">
        ← Simulados
      </AppLink>

      <Badge variant="sky" className="mb-4">
        {EXAM_TYPE_LABELS[exam.examType] ?? exam.examType}
      </Badge>
      <h1 className="hx-page-title">{exam.title}</h1>

      {exam.description && <p className="mt-4 text-slate-300">{exam.description}</p>}

      <div className="mt-4 flex gap-4 text-sm text-slate-400">
        <span>{exam._count.questions} questões</span>
        {exam.timeLimit && <span>Tempo sugerido: {exam.timeLimit} min</span>}
      </div>

      <div className="mt-8">
        {session?.user ? (
          <form action={startExamAction.bind(null, exam.id, slug)}>
            <Button type="submit" size="lg">
              Iniciar simulado
            </Button>
          </form>
        ) : (
          <LinkButton
            href={`/login?callbackUrl=/simulados/${slug}`}
            size="lg"
            aria-label="Entrar para iniciar simulado"
          >
            Entrar para iniciar
          </LinkButton>
        )}
      </div>
    </PageShell>
  );
}
