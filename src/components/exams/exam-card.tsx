import Link from "next/link";
import { Clock3, ClipboardList, Target } from "lucide-react";
import { EXAM_TYPE_LABELS } from "@/lib/validations/exam";

type ExamCardProps = {
  slug: string;
  title: string;
  description?: string | null;
  examType: string;
  questionCount: number;
  timeLimit?: number | null;
};

const examStyles: Record<string, string> = {
  ENEM: "border-blue-400/20 bg-blue-400/10 text-blue-200",
  VESTIBULAR: "border-violet-400/20 bg-violet-400/10 text-violet-200",
  TECNOLOGIA: "border-teal-400/20 bg-teal-400/10 text-teal-200",
};

export function ExamCard({
  slug,
  title,
  description,
  examType,
  questionCount,
  timeLimit,
}: ExamCardProps) {
  return (
    <Link
      href={`/simulados/${slug}`}
      className="group block overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-teal-400/35 hover:bg-white/[0.06]"
      aria-label={`Ver simulado: ${title}. ${questionCount} questões${timeLimit ? `, ${timeLimit} minutos` : ""}`}
    >
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${examStyles[examType] ?? "border-white/10 bg-white/5 text-slate-300"}`}>
            <Target className="h-3.5 w-3.5" />
            {EXAM_TYPE_LABELS[examType] ?? examType}
          </span>
        </div>

        <h3 className="text-lg font-bold leading-snug text-white transition-colors group-hover:text-teal-200">
          {title}
        </h3>
        {description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{description}</p>
        )}

        <div className="mt-5 flex items-center gap-4 border-t border-white/10 pt-4 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1.5">
            <ClipboardList className="h-4 w-4 text-teal-300" />
            {questionCount} questões
          </span>
          {timeLimit && (
            <span className="flex items-center gap-1.5">
              <Clock3 className="h-4 w-4 text-sky-300" />
              {timeLimit} min
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
