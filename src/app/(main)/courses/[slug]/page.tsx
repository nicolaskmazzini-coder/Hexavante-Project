// Importações necessárias para a página de detalhes do curso
import { auth } from "@/auth"; // Função para obter sessão do usuário
import { enrollAction } from "@/app/actions/enrollment"; // Action para matricular no curso
import { getCourseBySlug } from "@/services/course.service"; // Serviço para obter curso
import { getEnrollment } from "@/services/enrollment.service"; // Serviço para obter matrícula
import { countTotalLessons } from "@/services/course.service"; // Função para contar aulas
import Link from "next/link"; // Componente de link do Next.js
import { notFound } from "next/navigation"; // Função para página não encontrada

// Props da página de detalhes
type Props = { params: Promise<{ slug: string }> };

// Página de detalhes do curso
// Exibe informações do curso e permite matrícula, aplica tema azul e preto
export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params; // Obtém slug do curso
  const session = await auth(); // Obtém sessão do usuário
  const course = await getCourseBySlug(slug); // Busca curso pelo slug

  if (!course || course.status !== "APPROVED") notFound(); // Retorna 404 se não existir ou não estiver aprovado

  const enrollment = session?.user?.id
    ? await getEnrollment(session.user.id, course.id) // Busca matrícula do usuário
    : null;

  const totalLessons = countTotalLessons(course.modules); // Conta total de aulas

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-2 text-sm text-sky-300">{course.category.name}</div>
      <h1 className="text-3xl font-bold text-white">{course.title}</h1>
      {course.shortDescription && (
        <p className="mt-3 text-lg text-slate-300">{course.shortDescription}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
        <span>{course.modules.length} módulos</span>
        <span>{totalLessons} aulas</span>
        <span>{course.courseType === "FREE" ? "Gratuito" : course.courseType}</span>
        {course.instructors[0] && (
          <span>
            Instrutor: {course.instructors[0].user.fullName}
          </span>
        )}
      </div>

      {course.description && (
        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="font-semibold text-white">Sobre o curso</h2>
          <p className="mt-2 whitespace-pre-wrap text-slate-300">{course.description}</p>
        </div>
      )}

      <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="font-semibold text-white">Conteúdo</h2>
        <ul className="mt-4 space-y-4">
          {course.modules.map((mod) => (
            <li key={mod.id}>
              <p className="font-medium text-gray-200">
                {mod.orderNumber}. {mod.title}
              </p>
              <ul className="mt-2 space-y-1 pl-4 text-sm text-slate-400">
                {mod.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    Aula {lesson.orderNumber}: {lesson.title}
                  </li>
                ))}
                {mod.materials.map((mat) => (
                  <li key={mat.id} className="text-sky-300">
                    PDF: {mat.title}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        {enrollment ? (
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-sm text-slate-400">
              Progresso: <strong className="text-white">{Math.round(enrollment.progress)}%</strong>
            </div>
            <Link
              href={`/courses/${slug}/learn`}
              className="rounded-lg bg-[#2563eb] px-5 py-2.5 font-medium text-white hover:bg-[#1d4ed8]"
              aria-label="Continuar estudando"
            >
              Continuar estudando
            </Link>
          </div>
        ) : session?.user ? (
          <form action={enrollAction.bind(null, course.id, slug)}>
            <button
              type="submit"
              className="rounded-lg bg-[#2563eb] px-5 py-2.5 font-medium text-white hover:bg-[#1d4ed8]"
            >
              Matricular-se no curso
            </button>
          </form>
        ) : (
          <Link
            href={`/login?callbackUrl=/courses/${slug}`}
            className="inline-block rounded-lg bg-[#2563eb] px-5 py-2.5 font-medium text-white hover:bg-[#1d4ed8]"
            aria-label="Entrar para se matricular"
          >
            Entrar para se matricular
          </Link>
        )}
      </div>
    </div>
  );
}
