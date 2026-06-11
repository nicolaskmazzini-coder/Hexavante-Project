"use client";

import { createExamAction } from "@/app/actions/exam-admin";
import { ExamFormShell } from "@/components/exams/exam-form-shell";
import { AppLink } from "@/components/ui/app-link";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { ClipboardList } from "lucide-react";

export default function NewExamPage() {
  return (
    <PageShell size="md">
      <AppLink href="/moderacao/simulados" muted className="mb-4 inline-flex items-center gap-1">
        ← Simulados
      </AppLink>

      <PageHeader
        badge="Moderação"
        icon={ClipboardList}
        title="Novo simulado"
        description="Defina as informações básicas e adicione questões na próxima etapa."
      />

      <ExamFormShell
        action={createExamAction}
        submitLabel="Criar e adicionar questões"
        cancelHref="/moderacao/simulados"
      />
    </PageShell>
  );
}
