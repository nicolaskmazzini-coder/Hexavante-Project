import { auth } from "@/auth";
import { AppLink } from "@/components/ui/app-link";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { canModerate } from "@/lib/permissions";
import { EXAM_TYPE_LABELS } from "@/lib/validations/exam";
import { listExamsForAdmin } from "@/services/exam-admin.service";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, Shield } from "lucide-react";

export default async function ModerationExamsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/moderacao/simulados");
  if (!canModerate(session.user.roles)) redirect("/");

  const exams = await listExamsForAdmin();

  return (
    <PageShell>
      <AppLink href="/moderacao" muted className="mb-4 inline-flex items-center gap-1">
        ← Moderação
      </AppLink>

      <PageHeader
        badge="Moderação"
        icon={Shield}
        title="Simulados"
        description="Crie, edite e publique simulados da plataforma."
        action={
          <LinkButton href="/moderacao/simulados/new" size="sm">
            Novo simulado
          </LinkButton>
        }
      />

      {exams.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Nenhum simulado cadastrado.">
          <LinkButton href="/moderacao/simulados/new" className="mt-4">
            Criar primeiro simulado
          </LinkButton>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => (
            <Link
              key={exam.id}
              href={`/moderacao/simulados/${exam.id}/edit`}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-sky-400/35 hover:bg-white/[0.06]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-white">{exam.title}</h3>
                  <Badge variant={exam.isPublished ? "emerald" : "amber"}>
                    {exam.isPublished ? "Publicado" : "Rascunho"}
                  </Badge>
                  <Badge variant="teal">{EXAM_TYPE_LABELS[exam.examType]}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {exam._count.questions} questões · {exam._count.attempts} tentativas
                  {exam.timeLimit ? ` · ${exam.timeLimit} min` : ""}
                </p>
              </div>
              <span className="text-sm text-sky-300">Editar →</span>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
