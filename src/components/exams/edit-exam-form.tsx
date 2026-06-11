"use client";

import { updateExamAction } from "@/app/actions/exam-admin";
import { ExamFormShell } from "@/components/exams/exam-form-shell";

type Props = {
  examId: string;
  exam: {
    title: string;
    examType: string;
    description: string | null;
    coverImage: string | null;
    timeLimit: number | null;
    isPublished: boolean;
  };
};

export function EditExamForm({ examId, exam }: Props) {
  return (
    <ExamFormShell
      action={updateExamAction.bind(null, examId)}
      initial={exam}
      submitLabel="Salvar alterações"
      cancelHref="/moderacao/simulados"
    />
  );
}
