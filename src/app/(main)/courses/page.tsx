import Link from "next/link";
import { BookOpen, Search } from "lucide-react";
import { CourseCard } from "@/components/courses/course-card";
import { listApprovedCourses, listCategories } from "@/services/course.service";

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export default async function CoursesPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const [courses, categories] = await Promise.all([
    listApprovedCourses(category),
    listCategories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 rounded-xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-200">
              <BookOpen className="h-3.5 w-3.5" />
              Catálogo
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white">Cursos</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Escolha uma trilha, acompanhe módulos e avance no seu ritmo.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04]/70 px-4 py-3 text-sm text-slate-300">
            <span className="font-semibold text-white">{courses.length}</span> cursos encontrados
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/courses"
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            !category
              ? "border-sky-400/30 bg-sky-400/15 text-sky-100"
              : "border-white/10 bg-white/[0.035] text-slate-300 hover:border-sky-400/30 hover:bg-sky-400/10 hover:text-white"
          }`}
        >
          Todos
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/courses?category=${cat.id}`}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              category === cat.id
                ? "border-sky-400/30 bg-sky-400/15 text-sky-100"
                : "border-white/10 bg-white/[0.035] text-slate-300 hover:border-sky-400/30 hover:bg-sky-400/10 hover:text-white"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
          <Search className="mx-auto h-8 w-8 text-slate-500" />
          <p className="mt-3 font-semibold text-slate-200">Nenhum curso publicado ainda.</p>
          <p className="mt-1 text-sm text-slate-500">Novas trilhas aparecerão aqui quando forem aprovadas.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              slug={course.slug}
              title={course.title}
              shortDescription={course.shortDescription}
              categoryName={course.category.name}
              moduleCount={course._count.modules}
              enrollmentCount={course._count.enrollments}
              level={course.level}
              estimatedHours={course.estimatedHours}
            />
          ))}
        </div>
      )}
    </div>
  );
}
