import Link from "next/link";
import { Check, Lock, Star } from "lucide-react";

type LessonItem = {
  id: string;
  title: string;
  orderNumber: number;
  moduleId: string;
  moduleOrder: number;
  moduleTitle: string;
};

type LessonSidebarProps = {
  courseSlug: string;
  lessons: LessonItem[];
  currentLessonId: string;
  completedLessonIds: Set<string>;
  favoriteLessonIds?: Set<string>;
  progressionType: string;
};

export function LessonSidebar({
  courseSlug,
  lessons,
  currentLessonId,
  completedLessonIds,
  favoriteLessonIds = new Set(),
  progressionType,
}: LessonSidebarProps) {
  const lessonItems = lessons.reduce<{
    previousCompleted: boolean;
    items: {
      lesson: LessonItem;
      completed: boolean;
      isCurrent: boolean;
      showModuleTitle: boolean;
      locked: boolean;
      isFavorite: boolean;
    }[];
  }>(
    (state, lesson, index) => {
      const completed = completedLessonIds.has(lesson.id);
      const isCurrent = lesson.id === currentLessonId;
      const showModuleTitle = index === 0 || lessons[index - 1].moduleId !== lesson.moduleId;
      const locked =
        progressionType === "PROGRESSIVE" && !state.previousCompleted && !completed && !isCurrent;
      const previousCompleted = completed ? true : isCurrent ? state.previousCompleted : false;

      return {
        previousCompleted,
        items: [
          ...state.items,
          {
            lesson,
            completed,
            isCurrent,
            showModuleTitle,
            locked,
            isFavorite: favoriteLessonIds.has(lesson.id),
          },
        ],
      };
    },
    { previousCompleted: true, items: [] },
  ).items;

  return (
    <aside className="space-y-1">
      {lessonItems.map(({ lesson, completed, isCurrent, showModuleTitle, locked, isFavorite }) => (
        <div key={lesson.id}>
          {showModuleTitle && (
            <p className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Módulo {lesson.moduleOrder}: {lesson.moduleTitle}
            </p>
          )}
          {locked ? (
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500">
              <Lock className="h-4 w-4" />
              {lesson.orderNumber}. {lesson.title}
            </div>
          ) : (
            <Link
              href={`/courses/${courseSlug}/learn/${lesson.id}`}
              className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition ${
                isCurrent
                  ? "bg-primary text-white shadow-lg shadow-blue-950/20"
                  : completed
                    ? "text-emerald-300 hover:bg-emerald-400/10"
                    : "text-slate-300 hover:bg-white/[0.06]"
              }`}
              aria-label={completed ? `Aula concluída: ${lesson.title}` : `Aula: ${lesson.title}`}
            >
              <span className="min-w-0 truncate">
                {completed && !isCurrent ? <Check className="mr-1 inline h-4 w-4" /> : null}
                {lesson.orderNumber}. {lesson.title}
              </span>
              {isFavorite && (
                <Star className="h-3.5 w-3.5 shrink-0 fill-amber-300 text-amber-300" />
              )}
            </Link>
          )}
        </div>
      ))}
    </aside>
  );
}
