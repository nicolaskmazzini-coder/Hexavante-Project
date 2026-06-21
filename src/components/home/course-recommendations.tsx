import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { RecommendedCourse } from "@/services/recommendation.service";

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Iniciante",
  INTERMEDIATE: "Intermediário",
  ADVANCED: "Avançado",
};

type Props = {
  courses: RecommendedCourse[];
};

export function CourseRecommendations({ courses }: Props) {
  if (courses.length === 0) return null;

  return (
    <section data-tour="course-recommendations" className="mt-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-300" />
            <h2 className="text-lg font-bold text-white">Recomendados para você</h2>
          </div>
          <p className="mt-1 text-sm text-slate-400">Com base no que você já estuda na plataforma</p>
        </div>
        <Link
          href="/courses"
          className="hidden text-sm font-semibold text-sky-300 hover:text-sky-200 sm:inline-flex sm:items-center sm:gap-1"
        >
          Ver todos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {courses.map((course) => (
          <Link key={course.id} href={`/courses/${course.slug}`}>
            <Card
              padding="md"
              className="group h-full transition hover:border-violet-400/30 hover:bg-violet-400/5"
            >
              <div className="flex h-full flex-col">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-violet-300">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <Badge variant="default">{LEVEL_LABELS[course.level] ?? course.level}</Badge>
                </div>
                <h3 className="line-clamp-2 font-semibold text-white group-hover:text-violet-100">
                  {course.title}
                </h3>
                <p className="mt-1 text-xs text-violet-200/80">{course.reason}</p>
                {course.shortDescription && (
                  <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-400">
                    {course.shortDescription}
                  </p>
                )}
                <p className="mt-3 text-xs text-slate-500">
                  {course.categoryName} · {course.enrollmentCount} matrículas
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
