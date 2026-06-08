import { auth } from "@/auth";
import { canModerate } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { listPendingInstructorApplications } from "@/services/moderation.service";
import { APPLICATION_STATUS_LABELS } from "@/lib/permissions";

export default async function InstructorModerationPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/admin/moderation/instructors");
  
  if (!canModerate(session.user.roles)) {
    redirect("/");
  }

  const applications = await listPendingInstructorApplications();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/admin/moderation" className="text-sm font-semibold text-sky-300 hover:text-sky-200">
        ← Voltar para moderação
      </Link>
      <h1 className="mt-4 text-3xl font-semibold text-sky-200">MODERAÇÃO DE INSTRUTORES</h1>
      <p className="mt-2 text-slate-300">
        Aprove solicitações de novos instrutores.
      </p>

      {applications.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-[#334155] p-10 text-center text-slate-400">
          Nenhuma solicitação pendente.
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {applications.map((app: any) => (
            <div
              key={app.id}
              className="bg-white/[0.04] border border-white/10 p-6 rounded-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{app.user.fullName || app.user.username}</h3>
                  <p className="text-sm text-slate-400">{app.user.email}</p>
                  <p className="mt-2 text-sm text-slate-300">{app.reason}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Solicitado em {new Date(app.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/moderation/instructors/${app.id}/approve`}
                    className="bg-[#2563eb] text-white px-4 py-2 text-sm font-semibold transition hover:bg-[#1d4ed8]"
                  >
                    Aprovar
                  </Link>
                  <Link
                    href={`/admin/moderation/instructors/${app.id}/reject`}
                    className="bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700 transition-colors"
                  >
                    Rejeitar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
