import { Clock, Layers3, Users } from "lucide-react";
import { CourseThumbnail } from "@/components/courses/course-thumbnail";
import { StatusBadge } from "@/components/ui/status-badge";
import { COURSE_STATUS_LABELS } from "@/lib/permissions";
import { COURSE_LEVEL_LABELS } from "@/lib/course-labels";
import Link from "next/link";

type Props = {
  id: string;
  title: string;
  slug: string;
  status: string;
  thumbnailUrl?: string | null;
  coverImage?: string | null;
  categoryName: string;
  level: string;
  estimatedHours?: number | null;
  moduleCount: number;
  enrollmentCount: number;
};

export function InstructorCourseCard({
  id,
  title,
  status,
  thumbnailUrl,
  coverImage,
  categoryName,
  level,
  estimatedHours,
  moduleCount,
  enrollmentCount,
}: Props) {
  return (
    <Link
      href={`/instructor/courses/${id}/edit`}
      className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] transition hover:border-sky-400/35 hover:bg-white/[0.06]"
      aria-label={`Editar curso ${title}`}
    >
      <CourseThumbnail
        url={coverImage ?? thumbnailUrl}
        title={title}
        className="h-36 w-full transition group-hover:opacity-95"
      />
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-white group-hover:text-sky-200">{title}</h3>
          <StatusBadge status={status} label={COURSE_STATUS_LABELS[status] ?? status} />
        </div>
        <p className="mt-1 text-sm text-slate-400">
          {categoryName} · {COURSE_LEVEL_LABELS[level] ?? level}
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1.5">
            <Layers3 className="h-3.5 w-3.5 text-teal-300" />
            {moduleCount} módulos
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-sky-300" />
            {enrollmentCount} alunos
          </span>
          {estimatedHours != null && estimatedHours > 0 && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-300" />
              {estimatedHours}h
            </span>
          )}
        </div>
        <p className="mt-3 text-sm text-sky-300">Editar curso →</p>
      </div>
    </Link>
  );
}
