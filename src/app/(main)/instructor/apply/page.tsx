import { auth } from "@/auth";
import { InstructorApplyForm } from "@/components/moderation/instructor-apply-form";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppLink } from "@/components/ui/app-link";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { APPLICATION_STATUS_LABELS, isInstructor } from "@/lib/permissions";
import { getLatestInstructorApplication } from "@/services/moderation.service";
import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";

export default async function InstructorApplyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/instructor/apply");

  if (isInstructor(session.user.roles)) {
    redirect("/instructor/courses");
  }

  const application = await getLatestInstructorApplication(session.user.id);

  return (
    <PageShell>
      <AppLink href="/instructor/courses" muted className="mb-4 inline-flex items-center gap-1">
        ← Área do instrutor
      </AppLink>
      <PageHeader
        badge="Instrutor"
        icon={GraduationCap}
        title="Tornar-se instrutor"
        description="Envie sua solicitação. Um moderador analisará antes de liberar a criação de cursos."
      />

      {application?.status === "PENDING" ? (
        <Alert variant="warning" className="mt-2">
          <StatusBadge status="PENDING" label={APPLICATION_STATUS_LABELS.PENDING} />
          <p className="mt-3">
            Sua solicitação está em análise. Você receberá acesso à área de instrutor após aprovação.
          </p>
        </Alert>
      ) : application?.status === "REJECTED" ? (
        <div className="mt-2 space-y-6">
          <Alert variant="danger">
            Sua solicitação anterior foi rejeitada. Você pode enviar uma nova abaixo.
          </Alert>
          <InstructorApplyForm />
        </div>
      ) : (
        <div className="mt-2">
          <InstructorApplyForm />
        </div>
      )}
    </PageShell>
  );
}
