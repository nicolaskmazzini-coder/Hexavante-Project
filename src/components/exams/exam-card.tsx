import { Clock3, ClipboardList, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CardFooter, CardHeader, CardTitle, InteractiveCard } from "@/components/ui/card";
import { EXAM_TYPE_LABELS } from "@/lib/validations/exam";

type ExamCardProps = {
  slug: string;
  title: string;
  description?: string | null;
  examType: string;
  questionCount: number;
  timeLimit?: number | null;
  userAttemptCount?: number;
};

const examBadgeVariant: Record<string, "blue" | "violet" | "teal"> = {
  ENEM: "blue",
  VESTIBULAR: "violet",
  TECNOLOGIA: "teal",
};

export function ExamCard({
  slug,
  title,
  description,
  examType,
  questionCount,
  timeLimit,
  userAttemptCount,
}: ExamCardProps) {
  return (
    <InteractiveCard
      href={`/simulados/${slug}`}
      className="hover:border-teal-400/35"
      ariaLabel={`Ver simulado: ${title}. ${questionCount} questões${timeLimit ? `, ${timeLimit} minutos` : ""}`}
    >
      <div className="p-5">
        <CardHeader>
          <Badge variant={examBadgeVariant[examType] ?? "default"}>
            <Target className="h-3.5 w-3.5" />
            {EXAM_TYPE_LABELS[examType] ?? examType}
          </Badge>
        </CardHeader>

        <CardTitle className="transition-colors group-hover:text-teal-200">{title}</CardTitle>
        {description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{description}</p>
        )}

        <CardFooter className="text-xs font-medium text-slate-400">
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
          {userAttemptCount != null && userAttemptCount > 0 && (
            <span>{userAttemptCount} tentativa{userAttemptCount > 1 ? "s" : ""}</span>
          )}
        </CardFooter>
      </div>
    </InteractiveCard>
  );
}
