"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { completeLessonAction } from "@/app/actions/enrollment";

type Props = {
  courseSlug: string;
  lessonId: string;
  courseId: string;
  completed: boolean;
};

export function CompleteLessonButton({
  courseSlug,
  lessonId,
  courseId,
  completed,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [justCompleted, setJustCompleted] = useState(false);
  const [xpFeedback, setXpFeedback] = useState<string[]>([]);
  const router = useRouter();

  const showCompleted = completed || justCompleted;

  if (showCompleted && xpFeedback.length === 0) {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200">
        <CheckCircle2 className="h-5 w-5" />
        Aula concluída
      </div>
    );
  }

  if (showCompleted && xpFeedback.length > 0) {
    return (
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200">
          <CheckCircle2 className="h-5 w-5" />
          Aula concluída
        </div>

        <div className="rounded-xl border border-sky-400/20 bg-sky-400/10 p-4 shadow-lg shadow-black/20">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sky-200" />
            <p className="text-base font-semibold text-sky-100">XP ganho</p>
          </div>
          <ul className="space-y-2">
            {xpFeedback.map((msg) => (
              <li key={msg} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-300" />
                <span>{msg}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await completeLessonAction(courseSlug, lessonId, courseId);
          if (result.success) {
            setJustCompleted(true);
            if (result.xpMessages && result.xpMessages.length > 0) {
              setXpFeedback(result.xpMessages);
            }
            router.refresh();
          } else {
            alert(result.error);
          }
        });
      }}
      className="hx-btn-primary min-h-11 gap-2 disabled:translate-y-0 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Salvando...
        </>
      ) : (
        <>
          <CheckCircle2 className="h-4 w-4" />
          Marcar como concluída
        </>
      )}
    </button>
  );
}
