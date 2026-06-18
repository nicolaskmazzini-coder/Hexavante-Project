// Importações necessárias para a página de moderação de cursos
import { auth } from "@/auth"; // Função para obter sessão do usuário
import { StatusBadge } from "@/components/ui/status-badge"; // Componente de badge de status
import { canModerate } from "@/lib/permissions"; // Função para verificar permissão de moderador
import { listPendingCourses } from "@/services/moderation.service"; // Serviço para listar cursos pendentes
import Link from "next/link"; // Componente de link do Next.js
import { redirect } from "next/navigation"; // Função para redirecionar

// Página de moderação de cursos pendentes
// Exibe lista de cursos aguardando análise, aplica tema azul e preto
export default async function ModerateCoursesPage() {
  const session = await auth(); // Obtém sessão do usuário
  if (!session?.user?.id) redirect("/login?callbackUrl=/moderacao/cursos"); // Redireciona se não estiver logado
  if (!canModerate(session.user.roles)) redirect("/"); // Redireciona se não for moderador

  const courses = await listPendingCourses(); // Busca cursos pendentes

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/moderacao"
        className="text-sm text-sky-300 hover:underline"
        aria-label="Voltar para moderação"
      >
        ← Moderação
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Cursos pendentes</h1>

      {courses.length === 0 ? (
        <p className="mt-8 text-slate-400">Nenhum curso aguardando análise.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {courses.map((course) => (
            <li key={course.id}>
              <Link
                href={`/moderacao/cursos/${course.id}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-4 hover:border-sky-400/35"
                aria-label={`Analisar curso ${course.title}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{course.title}</p>
                    <StatusBadge status="PENDING_REVIEW" label="Pendente" />
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    {course.category.name} · {course._count.modules} módulos · Instrutor:{" "}
                    {course.instructors[0]?.user.fullName ?? "—"}
                  </p>
                </div>
                <span className="text-sm text-sky-300">Analisar →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
