// Importações necessárias para a página de edição de curso
import { auth } from "@/auth"; // Função para obter sessão do usuário
import {
  addLessonAction,
  addMaterialAction,
  addModuleAction,
  updateCourseAction,
} from "@/app/actions/course"; // Actions para gerenciar curso
import { resubmitCourseAction } from "@/app/actions/moderation"; // Action para reenviar curso para moderação
import { InlineForm } from "@/components/courses/inline-form"; // Componente de formulário inline
import { StatusBadge } from "@/components/ui/status-badge"; // Componente de badge de status
import { COURSE_STATUS_LABELS, isInstructor } from "@/lib/permissions"; // Funções de permissão e labels
import { getCourseById, listCategories } from "@/services/course.service"; // Serviços de curso
import Link from "next/link"; // Componente de link do Next.js
import { notFound, redirect } from "next/navigation"; // Funções de navegação

// Props da página de edição
type Props = { params: Promise<{ id: string }> };

// Página de edição de curso do instrutor
// Permite editar informações, módulos, aulas e materiais, aplica tema azul e preto
export default async function EditCoursePage({ params }: Props) {
  const { id } = await params; // Obtém ID do curso
  const session = await auth(); // Obtém sessão do usuário
  if (!session?.user?.id) redirect(`/login?callbackUrl=/instructor/courses/${id}/edit`); // Redireciona se não estiver logado
  if (!isInstructor(session.user.roles)) redirect("/instructor/courses"); // Redireciona se não for instrutor

  const result = await getCourseById(id, session.user.id); // Busca curso com verificação de permissão
  if (!result || !result.isInstructor) notFound(); // Retorna 404 se não for instrutor do curso

  const { course } = result;
  const categories = await listCategories(); // Busca categorias disponíveis
  const nextModuleOrder = course.modules.length + 1; // Calcula ordem do próximo módulo

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/instructor/courses" className="text-sm text-sky-300 hover:underline" aria-label="Voltar para meus cursos">
        ← Meus cursos
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Editar: {course.title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <StatusBadge
          status={course.status}
          label={COURSE_STATUS_LABELS[course.status] ?? course.status}
        />
        {course.status === "APPROVED" && (
          <Link href={`/courses/${course.slug}`} className="text-sm text-sky-300 hover:underline" aria-label="Ver página pública">
            Ver página pública →
          </Link>
        )}
      </div>

      {(course.status === "REVISION_REQUIRED" || course.status === "REJECTED") && (
        <div className="mt-4 rounded-xl border border-orange-900/50 bg-orange-900/10 p-4">
          <p className="text-sm text-orange-400">
            Ajuste o conteúdo e reenvie para nova análise do moderador.
          </p>
          <form action={resubmitCourseAction.bind(null, id)} className="mt-3">
            <button
              type="submit"
              className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm text-white hover:bg-[#1d4ed8]"
            >
              Reenviar para análise
            </button>
          </form>
        </div>
      )}

      {course.status === "PENDING_REVIEW" && (
        <p className="mt-4 rounded-xl border border-amber-900/50 bg-amber-900/10 p-4 text-sm text-amber-400">
          Este curso está aguardando aprovação de um moderador e ainda não aparece no catálogo público.
        </p>
      )}

      {course.status === "APPROVED" && (
        <p className="mt-4 rounded-xl border border-sky-900/50 bg-sky-900/10 p-4 text-sm text-sky-300">
          Alterações nas informações do curso reenviam o conteúdo para análise do moderador.
        </p>
      )}

      <section className="mt-8 rounded-xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="font-semibold text-white">Informações do curso</h2>
        <InlineForm
          title=""
          submitLabel="Salvar alterações"
          action={updateCourseAction.bind(null, id)}
          fields={[
            { name: "title", label: "Título", defaultValue: course.title },
            {
              name: "categoryId",
              label: "Categoria",
              defaultValue: course.categoryId,
              options: categories.map((c) => ({ value: c.id, label: c.name })),
            },
            {
              name: "shortDescription",
              label: "Descrição curta",
              defaultValue: course.shortDescription ?? "",
            },
            {
              name: "description",
              label: "Descrição",
              type: "textarea",
              defaultValue: course.description ?? "",
              required: false,
            },
            {
              name: "level",
              label: "Nível",
              defaultValue: course.level,
              options: [
                { value: "BEGINNER", label: "Iniciante" },
                { value: "INTERMEDIATE", label: "Intermediário" },
                { value: "ADVANCED", label: "Avançado" },
              ],
            },
            {
              name: "estimatedHours",
              label: "Carga horária (horas)",
              type: "number",
              defaultValue: course.estimatedHours ? String(course.estimatedHours) : "",
              required: false,
            },
            {
              name: "progressionType",
              label: "Progressão",
              defaultValue: course.progressionType,
              options: [
                { value: "FREE", label: "Livre" },
                { value: "PROGRESSIVE", label: "Progressiva" },
              ],
            },
          ]}
        />
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Módulos e conteúdo</h2>

        {course.modules.map((mod) => (
          <div key={mod.id} className="mb-6 rounded-xl border border-white/10 bg-white/[0.04] p-6">
            <h3 className="font-semibold text-white">
              Módulo {mod.orderNumber}: {mod.title}
            </h3>
            {mod.description && (
              <p className="mt-1 text-sm text-slate-400">{mod.description}</p>
            )}

            <ul className="mt-3 space-y-1 text-sm text-slate-400">
              {mod.lessons.map((l) => (
                <li key={l.id}>
                  Aula {l.orderNumber}: {l.title}
                  {l.videoUrl && <span className="text-slate-500"> (vídeo)</span>}
                </li>
              ))}
              {mod.materials.map((m) => (
                <li key={m.id} className="text-sky-300">
                  PDF: {m.title}
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-4">
              <InlineForm
                title="Adicionar aula"
                submitLabel="Adicionar aula"
                action={addLessonAction.bind(null, id, mod.id)}
                fields={[
                  { name: "title", label: "Título da aula" },
                  {
                    name: "orderNumber",
                    label: "Ordem",
                    type: "number",
                    defaultValue: String(mod.lessons.length + 1),
                  },
                  {
                    name: "videoUrl",
                    label: "URL do vídeo (YouTube/Vimeo)",
                    required: false,
                  },
                  {
                    name: "videoProvider",
                    label: "Provedor",
                    defaultValue: "youtube",
                    options: [
                      { value: "youtube", label: "YouTube" },
                      { value: "vimeo", label: "Vimeo" },
                      { value: "other", label: "Outro" },
                    ],
                  },
                  {
                    name: "description",
                    label: "Descrição",
                    type: "textarea",
                    required: false,
                  },
                ]}
              />
              <InlineForm
                title="Adicionar material PDF"
                submitLabel="Adicionar material"
                action={addMaterialAction.bind(null, id, mod.id)}
                fields={[
                  { name: "title", label: "Título do material" },
                  {
                    name: "fileUrl",
                    label: "URL do PDF",
                    placeholder: "https://...",
                  },
                  {
                    name: "fileType",
                    label: "Tipo",
                    defaultValue: "pdf",
                    required: false,
                  },
                ]}
              />
            </div>
          </div>
        ))}

        <InlineForm
          title="Novo módulo"
          submitLabel="Adicionar módulo"
          action={addModuleAction.bind(null, id)}
          fields={[
            { name: "title", label: "Título do módulo" },
            {
              name: "orderNumber",
              label: "Ordem",
              type: "number",
              defaultValue: String(nextModuleOrder),
            },
            {
              name: "description",
              label: "Descrição",
              type: "textarea",
              required: false,
            },
          ]}
        />
      </section>
    </div>
  );
}
