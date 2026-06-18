import { auth } from "@/auth";
import {
  addExamQuestionAction,
  deleteExamAction,
  deleteExamQuestionAction,
} from "@/app/actions/exam-admin";
import { DeleteContentButton } from "@/components/courses/delete-content-button";
import { EditExamForm } from "@/components/exams/edit-exam-form";
import { ExamQuestionImage } from "@/components/exams/exam-question-image";
import { ExamQuestionForm } from "@/components/exams/exam-question-form";
import { AppLink } from "@/components/ui/app-link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { canModerate } from "@/lib/permissions";
import { EXAM_QUESTION_TYPE_LABELS, EXAM_TYPE_LABELS } from "@/lib/validations/exam";
import { getExamForAdmin } from "@/services/exam-admin.service";
import { notFound, redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function EditExamPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/moderacao/simulados/${id}/edit`);
  if (!canModerate(session.user.roles)) redirect("/");

  const exam = await getExamForAdmin(id);
  if (!exam) notFound();

  const nextOrder = exam.questions.length + 1;

  return (
    <PageShell size="md">
      <AppLink href="/moderacao/simulados" muted className="mb-4 inline-flex items-center gap-1">
        ← Simulados
      </AppLink>

      <PageHeader
        badge="Moderação"
        icon={ClipboardList}
        title={`Editar: ${exam.title}`}
        description="Atualize informações, questões e publique quando estiver pronto."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge variant={exam.isPublished ? "emerald" : "amber"}>
          {exam.isPublished ? "Publicado" : "Rascunho"}
        </Badge>
        <Badge variant="teal">{EXAM_TYPE_LABELS[exam.examType]}</Badge>
        <Badge>{exam._count.questions} questões</Badge>
      </div>

      <Card padding="lg" className="mb-8">
        <h2 className="font-semibold text-white">Informações do simulado</h2>
        <div className="mt-4">
          <EditExamForm
            examId={id}
            exam={{
              title: exam.title,
              examType: exam.examType,
              description: exam.description,
              coverImage: exam.coverImage,
              timeLimit: exam.timeLimit,
              isPublished: exam.isPublished,
            }}
          />
        </div>
      </Card>

      <section className="mb-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">Questões</h2>
        {exam.questions.map((question) => {
          const isEssay = question.type === "ESSAY";
          const correct = question.alternatives.find((alt) => alt.isCorrect);
          return (
            <Card key={question.id} padding="md">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-white">
                      {question.orderNumber}. {question.statement}
                    </p>
                    <Badge variant={isEssay ? "amber" : "teal"}>
                      {EXAM_QUESTION_TYPE_LABELS[question.type] ?? question.type}
                    </Badge>
                  </div>
                  <ExamQuestionImage
                    url={question.imageUrl}
                    naturalWidth={question.imageWidth}
                    naturalHeight={question.imageHeight}
                    displaySize={question.imageDisplaySize}
                    alt={`Imagem da questão ${question.orderNumber}`}
                  />
                  {isEssay ? (
                    question.expectedAnswer && (
                      <p className="mt-2 text-sm text-slate-400">
                        <span className="font-medium text-slate-300">Gabarito de referência:</span>{" "}
                        {question.expectedAnswer}
                      </p>
                    )
                  ) : (
                    <>
                      <ul className="mt-2 space-y-1 text-sm text-slate-400">
                        {question.alternatives.map((alt, index) => (
                          <li
                            key={alt.id}
                            className={alt.isCorrect ? "font-medium text-emerald-300" : undefined}
                          >
                            {String.fromCharCode(65 + index)}) {alt.text}
                            {alt.isCorrect ? " ✓" : ""}
                          </li>
                        ))}
                      </ul>
                      {correct && (
                        <p className="mt-2 text-xs text-slate-500">Gabarito: {correct.text}</p>
                      )}
                    </>
                  )}
                </div>
                <DeleteContentButton
                  action={deleteExamQuestionAction.bind(null, id, question.id)}
                  label="Excluir"
                  confirmMessage="Excluir esta questão?"
                />
              </div>
            </Card>
          );
        })}
      </section>

      <ExamQuestionForm
        examId={id}
        nextOrder={nextOrder}
        action={addExamQuestionAction.bind(null, id)}
      />

      <div className="mt-8 border-t border-white/10 pt-6">
        <DeleteContentButton
          action={deleteExamAction.bind(null, id)}
          label="Excluir simulado"
          confirmMessage="Excluir este simulado e todas as questões?"
        />
      </div>
    </PageShell>
  );
}
