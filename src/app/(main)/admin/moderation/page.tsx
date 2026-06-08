import { auth } from "@/auth";
import { canModerate } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ModerationPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/admin/moderation");
  
  if (!canModerate(session.user.roles)) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-sky-200">MODERAÇÃO</h1>
        <p className="mt-2 text-slate-300">
          Aprove solicitações de instrutores e cursos.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/admin/moderation/instructors"
          className="bg-white/[0.04] border border-sky-400/20 p-6 rounded-xl hover:border-sky-400/35 hover:shadow-black/20 transition-all"
        >
          <h2 className="text-xl font-semibold text-white mb-2">Instrutores</h2>
          <p className="text-slate-400 text-sm">
            Aprovar solicitações de novos instrutores
          </p>
        </Link>

        <Link
          href="/admin/moderation/courses"
          className="bg-white/[0.04] border border-sky-400/20 p-6 rounded-xl hover:border-sky-400/35 hover:shadow-black/20 transition-all"
        >
          <h2 className="text-xl font-semibold text-white mb-2">Cursos</h2>
          <p className="text-slate-400 text-sm">
            Aprovar cursos criados por instrutores
          </p>
        </Link>
      </div>
    </div>
  );
}
