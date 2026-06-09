import Link from "next/link";
import { BookOpen, Search } from "lucide-react";
import { CourseCard } from "@/components/courses/course-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { listApprovedCourses, listCategories } from "@/services/course.service";
import { cn } from "@/lib/cn";

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
    <PageShell>
      <PageHeader
        badge="Catálogo"
        icon={BookOpen}
        title="Cursos"
        description="Escolha uma trilha, acompanhe módulos e avance no seu ritmo."
        action={
          <Card padding="sm" className="text-sm text-slate-300">
            <span className="font-semibold text-white">{courses.length}</span> cursos encontrados
          </Card>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/courses"
          className={cn("hx-filter-pill", !category ? "hx-filter-pill-active" : "hx-filter-pill-inactive")}
        >
          Todos
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/courses?category=${cat.id}`}
            className={cn(
              "hx-filter-pill",
              category === cat.id ? "hx-filter-pill-active" : "hx-filter-pill-inactive",
            )}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhum curso publicado ainda."
          description="Novas trilhas aparecerão aqui quando forem aprovadas."
        />
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
    </PageShell>
  );
}
