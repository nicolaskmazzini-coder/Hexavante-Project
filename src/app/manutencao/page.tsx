import { auth } from "@/auth";
import { isAdmin } from "@/lib/permissions";
import { getMaintenanceMode } from "@/services/platform-settings.service";
import { redirect } from "next/navigation";

export default async function MaintenancePage() {
  const session = await auth();
  const maintenance = await getMaintenanceMode();

  if (!maintenance.enabled) redirect("/");
  if (isAdmin(session?.user?.roles)) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-4">
      <div className="max-w-lg rounded-xl border border-[#1e1e2e] bg-[#111120] p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-2xl">
          🔧
        </div>
        <h1 className="text-2xl font-bold text-white">Manutenção</h1>
        <p className="mt-4 whitespace-pre-wrap text-slate-300">{maintenance.message}</p>
        <p className="mt-6 text-sm text-slate-500">
          Equipe técnica: faça login com conta de administrador para acessar o painel.
        </p>
        <a
          href="/login"
          className="mt-6 inline-block rounded-lg bg-sky-600 px-4 py-2 text-sm text-white transition hover:bg-sky-500"
        >
          Ir para login
        </a>
      </div>
    </div>
  );
}
