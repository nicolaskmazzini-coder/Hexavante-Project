import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ModerationContentPage() {
  const [courses, exams] = await Promise.all([
    prisma.course.findMany({
      take: 15,
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, slug: true, status: true },
    }),
    prisma.exam.findMany({
      take: 15,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, slug: true, isPublished: true },
    }),
  ]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Cursos</h2>
          <Link href="/moderacao/cursos" className="text-sm text-sky-400 hover:underline">
            Ver fila completa →
          </Link>
        </div>
        <ul className="space-y-2">
          {courses.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <div>
                <p className="font-medium text-white">{c.title}</p>
                <p className="text-xs text-slate-500">{c.status}</p>
              </div>
              <Link href={`/moderacao/cursos/${c.id}`} className="text-sm text-sky-400">
                Revisar
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Simulados</h2>
          <Link href="/moderacao/simulados" className="text-sm text-sky-400 hover:underline">
            Gerenciar →
          </Link>
        </div>
        <ul className="space-y-2">
          {exams.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <div>
                <p className="font-medium text-white">{e.title}</p>
                <p className="text-xs text-slate-500">{e.isPublished ? "Publicado" : "Rascunho"}</p>
              </div>
              <Link href={`/moderacao/simulados/${e.id}/edit`} className="text-sm text-sky-400">
                Editar
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-slate-500">
          Denúncias de conteúdo: em breve. Use o terminal{" "}
          <code className="text-sky-300">/cursos</code> e{" "}
          <code className="text-sky-300">/simulado</code>.
        </p>
      </section>
    </div>
  );
}
