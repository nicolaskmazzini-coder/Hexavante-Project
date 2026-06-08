import Link from "next/link";
import { BookOpen, Clock, Layers3, Users } from "lucide-react";

type CourseCardProps = {
  slug: string;
  title: string;
  shortDescription?: string | null;
  categoryName: string;
  moduleCount: number;
  enrollmentCount: number;
  level: string;
  estimatedHours?: number | null;
};

const levelLabel: Record<string, string> = {
  BEGINNER: "Iniciante",
  INTERMEDIATE: "Intermediário",
  ADVANCED: "Avançado",
};

export function CourseCard({
  slug,
  title,
  shortDescription,
  categoryName,
  moduleCount,
  enrollmentCount,
  level,
  estimatedHours,
}: CourseCardProps) {
  return (
    <Link
      href={`/courses/${slug}`}
      className="group block overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/35 hover:bg-white/[0.06]"
      aria-label={`Ver curso: ${title}. Categoria: ${categoryName}. ${moduleCount} módulos, ${enrollmentCount} alunos matriculados.`}
    >
      <div className="h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-teal-400" />
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-200">
            <BookOpen className="h-3.5 w-3.5" />
            {categoryName}
          </span>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
            {levelLabel[level] ?? level}
          </span>
        </div>

        <h3 className="text-lg font-bold leading-snug text-white transition-colors group-hover:text-sky-200">
          {title}
        </h3>
        {shortDescription && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{shortDescription}</p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-white/10 pt-4 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1.5">
            <Layers3 className="h-4 w-4 text-teal-300" />
            {moduleCount} módulos
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-sky-300" />
            {enrollmentCount} alunos
          </span>
          {estimatedHours != null && estimatedHours > 0 && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-300" />
              {estimatedHours}h
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
