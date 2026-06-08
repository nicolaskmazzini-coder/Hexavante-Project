import { auth } from "@/auth";
import { InstructorApplyForm } from "@/components/moderation/instructor-apply-form";
import { StatusBadge } from "@/components/ui/status-badge";
import { APPLICATION_STATUS_LABELS, isInstructor } from "@/lib/permissions";
import { getLatestInstructorApplication } from "@/services/moderation.service";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function InstructorApplyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/instructor/apply");

  if (isInstructor(session.user.roles)) {
    redirect("/instructor/courses");
  }

  const application = await getLatestInstructorApplication(session.user.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/instructor/courses" className="text-sm text-indigo-600 hover:underline">
        ← Área do instrutor
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Tornar-se instrutor</h1>
      <p className="mt-2 text-slate-600">
        Envie sua solicitação. Um moderador analisará antes de liberar a criação de cursos.
      </p>

      {application?.status === "PENDING" ? (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6">
          <StatusBadge
            status="PENDING"
            label={APPLICATION_STATUS_LABELS.PENDING}
          />
          <p className="mt-3 text-slate-700">
            Sua solicitação está em análise. Você receberá acesso à área de instrutor após aprovação.
          </p>
        </div>
      ) : application?.status === "REJECTED" ? (
        <div className="mt-8 space-y-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            Sua solicitação anterior foi rejeitada. Você pode enviar uma nova abaixo.
          </div>
          <InstructorApplyForm />
        </div>
      ) : (
        <div className="mt-8">
          <InstructorApplyForm />
        </div>
      )}
    </div>
  );
}
