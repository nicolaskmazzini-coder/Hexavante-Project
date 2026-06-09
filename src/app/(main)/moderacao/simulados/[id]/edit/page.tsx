import { auth } from "@/auth";
import {
  addExamQuestionAction,
  deleteExamAction,
  deleteExamQuestionAction,
  updateExamAction,
} from "@/app/actions/exam-admin";
import { DeleteContentButton } from "@/components/courses/delete-content-button";
import { ExamQuestionForm } from "@/components/exams/exam-question-form";
import { InlineForm } from "@/components/courses/inline-form";
import { AppLink } from "@/components/ui/app-link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { canModerate } from "@/lib/permissions";
import { EXAM_TYPE_LABELS } from "@/lib/validations/exam";
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
          <InlineForm
            title=""
            submitLabel="Salvar alterações"
            action={updateExamAction.bind(null, id)}
            fields={[
              { name: "title", label: "Título", defaultValue: exam.title },
              {
                name: "examType",
                label: "Tipo",
                defaultValue: exam.examType,
                options: [
                  { value: "ENEM", label: "ENEM" },
                  { value: "VESTIBULAR", label: "Vestibular" },
                  { value: "TECNOLOGIA", label: "Tecnologia" },
                ],
              },
              {
                name: "description",
                label: "Descrição",
                type: "textarea",
                defaultValue: exam.description ?? "",
                required: false,
              },
              {
                name: "timeLimit",
                label: "Tempo limite (min)",
                type: "number",
                defaultValue: exam.timeLimit ? String(exam.timeLimit) : "",
                required: false,
              },
              {
                name: "isPublished",
                label: "Status",
                defaultValue: exam.isPublished ? "true" : "false",
                options: [
                  { value: "false", label: "Rascunho" },
                  { value: "true", label: "Publicado" },
                ],
              },
            ]}
          />
        </div>
      </Card>

      <section className="mb-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">Questões</h2>
        {exam.questions.map((question) => {
          const correct = question.alternatives.find((alt) => alt.isCorrect);
          return (
            <Card key={question.id} padding="md">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">
                    {question.orderNumber}. {question.statement}
                  </p>
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
                    <p className="mt-2 text-xs text-slate-500">
                      Gabarito: {correct.text}
                    </p>
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
