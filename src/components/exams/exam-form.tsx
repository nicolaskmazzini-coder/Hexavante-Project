"use client";

import { useActionState, useCallback, useRef, useState } from "react";
import {
  submitExamAction,
  submitExamTimeoutAction,
  type ActionResult,
} from "@/app/actions/exam";
import { ExamTimer } from "@/components/exams/exam-timer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Question = {
  id: string;
  statement: string;
  orderNumber: number;
  alternatives: { id: string; text: string }[];
};

type ExamFormProps = {
  slug: string;
  attemptId: string;
  title: string;
  questions: Question[];
  startedAt: string;
  timeLimitMinutes?: number | null;
};

const initialState: ActionResult = { success: false };

export function ExamForm({
  slug,
  attemptId,
  title,
  questions,
  startedAt,
  timeLimitMinutes,
}: ExamFormProps) {
  const [state, formAction, pending] = useActionState(submitExamAction, initialState);
  const [, timeoutAction, timeoutPending] = useActionState(submitExamTimeoutAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const timeoutFormRef = useRef<HTMLFormElement>(null);
  const [activeQuestionId, setActiveQuestionId] = useState(questions[0]?.id ?? "");
  const [answered, setAnswered] = useState<Record<string, boolean>>({});

  const handleExpire = useCallback(() => {
    const main = formRef.current;
    const timeout = timeoutFormRef.current;
    if (!main) return;

    if (timeLimitMinutes && timeout) {
      for (const question of questions) {
        const selected = main.querySelector<HTMLInputElement>(
          `input[name="q_${question.id}"]:checked`,
        );
        const hidden = timeout.querySelector<HTMLInputElement>(
          `input[name="q_${question.id}"]`,
        );
        if (hidden && selected) hidden.value = selected.value;
      }
      timeout.requestSubmit();
      return;
    }

    main.requestSubmit();
  }, [timeLimitMinutes, questions]);

  const markAnswered = (questionId: string) => {
    setAnswered((prev) => ({ ...prev, [questionId]: true }));
  };

  return (
    <div className="space-y-6">
      {timeLimitMinutes ? (
        <ExamTimer
          startedAt={startedAt}
          timeLimitMinutes={timeLimitMinutes}
          onExpire={handleExpire}
        />
      ) : null}

      <div className="flex flex-wrap gap-2">
        {questions.map((question) => (
          <button
            key={question.id}
            type="button"
            onClick={() => {
              setActiveQuestionId(question.id);
              document.getElementById(`question-${question.id}`)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
            className={cn(
              "min-h-9 min-w-9 rounded-lg border px-3 text-sm font-semibold transition",
              activeQuestionId === question.id
                ? "border-teal-400/50 bg-teal-400/15 text-teal-200"
                : answered[question.id]
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                  : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-sky-400/30",
            )}
          >
            {question.orderNumber}
          </button>
        ))}
      </div>

      <form ref={formRef} action={formAction} className="space-y-8">
        <input type="hidden" name="attemptId" value={attemptId} />
        <input type="hidden" name="slug" value={slug} />

        {questions.map((question) => (
          <fieldset
            key={question.id}
            id={`question-${question.id}`}
            className="scroll-mt-24 rounded-xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/15"
          >
            <legend className="mb-3 text-base font-semibold text-white">
              {question.orderNumber}. {question.statement}
            </legend>
            <div className="space-y-2">
              {question.alternatives.map((alt) => (
                <label
                  key={alt.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-slate-950/35 px-3 py-2.5 transition hover:border-teal-400/30 hover:bg-teal-400/10"
                >
                  <input
                    type="radio"
                    name={`q_${question.id}`}
                    value={alt.id}
                    required
                    className="mt-1 accent-teal-400"
                    onChange={() => {
                      markAnswered(question.id);
                      setActiveQuestionId(question.id);
                    }}
                  />
                  <span className="text-sm leading-6 text-slate-300">{alt.text}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        {state.error && (
          <p className="rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={pending || timeoutPending} className="w-full sm:w-auto">
          {pending ? "Corrigindo..." : `Finalizar ${title}`}
        </Button>
      </form>

      {timeLimitMinutes ? (
        <form ref={timeoutFormRef} action={timeoutAction} className="hidden" aria-hidden>
          <input type="hidden" name="attemptId" value={attemptId} />
          <input type="hidden" name="slug" value={slug} />
          {questions.map((question) => (
            <input
              key={question.id}
              type="hidden"
              name={`q_${question.id}`}
              defaultValue=""
            />
          ))}
        </form>
      ) : null}
    </div>
  );
}
