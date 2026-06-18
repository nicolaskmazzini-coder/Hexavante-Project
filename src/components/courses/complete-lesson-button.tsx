"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { completeLessonAction } from "@/app/actions/enrollment";
import { useToast } from "@/components/ui/toast";

type Props = {
  courseSlug: string;
  lessonId: string;
  courseId: string;
  completed: boolean;
};

export function CompleteLessonButton({ courseSlug, lessonId, courseId, completed }: Props) {
  const [pending, startTransition] = useTransition();
  const [justCompleted, setJustCompleted] = useState(false);
  const [xpFeedback, setXpFeedback] = useState<string[]>([]);
  const [newLevel, setNewLevel] = useState<number | null>(null);
  const router = useRouter();
  const { toast } = useToast();

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
        {newLevel && (
          <div className="animate-pulse rounded-xl border border-sky-400/30 bg-gradient-to-r from-sky-500/20 to-teal-400/15 px-4 py-3 text-sm font-semibold text-sky-100">
            <Sparkles className="mr-2 inline h-4 w-4" />
            Novo nível desbloqueado: {newLevel}
          </div>
        )}
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
            {xpFeedback.map((msg, index) => (
              <li key={`${msg}-${index}`} className="flex items-start gap-2 text-sm text-slate-300">
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
            if (result.leveledUp && result.newLevel) {
              setNewLevel(result.newLevel);
              toast(`Level up! Você alcançou o nível ${result.newLevel}.`, "success");
            }
            router.refresh();
          } else {
            toast(result.error ?? "Erro ao marcar aula", "error");
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
