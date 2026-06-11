"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import {
  submitExamAction,
  submitExamTimeoutAction,
  type ActionResult,
} from "@/app/actions/exam";
import { ExamQuestionImage } from "@/components/exams/exam-question-image";
import { ExamTimer } from "@/components/exams/exam-timer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/cn";

type Question = {
  id: string;
  statement: string;
  imageUrl?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  imageDisplaySize?: "SMALL" | "MEDIUM" | "LARGE" | "FULL" | null;
  orderNumber: number;
  type: "MULTIPLE_CHOICE" | "ESSAY";
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
const ESSAY_MAX = 2000;

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
  const [essayDrafts, setEssayDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    const drafts: Record<string, string> = {};
    for (const question of questions) {
      if (question.type !== "ESSAY") continue;
      const key = `exam-essay-${attemptId}-${question.id}`;
      const saved = sessionStorage.getItem(key);
      if (saved) {
        drafts[question.id] = saved;
        setAnswered((prev) => ({ ...prev, [question.id]: saved.trim().length > 0 }));
      }
    }
    setEssayDrafts(drafts);
  }, [attemptId, questions]);

  const syncTimeoutForm = useCallback(() => {
    const main = formRef.current;
    const timeout = timeoutFormRef.current;
    if (!main || !timeout) return;

    for (const question of questions) {
      if (question.type === "ESSAY") {
        const essayInput = timeout.querySelector<HTMLTextAreaElement>(
          `textarea[name="essay_${question.id}"]`,
        );
        if (essayInput) {
          essayInput.value = essayDrafts[question.id] ?? "";
        }
        continue;
      }

      const selected = main.querySelector<HTMLInputElement>(
        `input[name="q_${question.id}"]:checked`,
      );
      const hidden = timeout.querySelector<HTMLInputElement>(
        `input[name="q_${question.id}"]`,
      );
      if (hidden && selected) hidden.value = selected.value;
    }
  }, [questions, essayDrafts]);

  const handleExpire = useCallback(() => {
    const main = formRef.current;
    const timeout = timeoutFormRef.current;
    if (!main) return;

    if (timeLimitMinutes && timeout) {
      syncTimeoutForm();
      timeout.requestSubmit();
      return;
    }

    main.requestSubmit();
  }, [timeLimitMinutes, syncTimeoutForm]);

  const markAnswered = (questionId: string) => {
    setAnswered((prev) => ({ ...prev, [questionId]: true }));
  };

  const handleEssayChange = (questionId: string, value: string) => {
    const trimmed = value.slice(0, ESSAY_MAX);
    setEssayDrafts((prev) => ({ ...prev, [questionId]: trimmed }));
    sessionStorage.setItem(`exam-essay-${attemptId}-${questionId}`, trimmed);
    setAnswered((prev) => ({ ...prev, [questionId]: trimmed.trim().length > 0 }));
    setActiveQuestionId(questionId);
  };

  return (
    <div className="space-y-6">
      {timeLimitMinutes ? (
        <ExamTimer
          mode="countdown"
          startedAt={startedAt}
          attemptId={attemptId}
          timeLimitMinutes={timeLimitMinutes}
          onExpire={handleExpire}
        />
      ) : (
        <ExamTimer mode="elapsed" startedAt={startedAt} attemptId={attemptId} />
      )}

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
            className="scroll-mt-28 rounded-xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/15"
          >
            <legend className="mb-3 block text-base font-semibold text-white">
              <span>
                {question.orderNumber}. {question.statement}
                {question.type === "ESSAY" && (
                  <span className="ml-2 text-xs font-normal text-amber-300">(Dissertativa)</span>
                )}
              </span>
              <ExamQuestionImage
                url={question.imageUrl}
                naturalWidth={question.imageWidth}
                naturalHeight={question.imageHeight}
                displaySize={question.imageDisplaySize}
                alt={`Imagem da questão ${question.orderNumber}`}
              />
            </legend>

            {question.type === "ESSAY" ? (
              <div className="space-y-2">
                <Textarea
                  name={`essay_${question.id}`}
                  rows={6}
                  maxLength={ESSAY_MAX}
                  value={essayDrafts[question.id] ?? ""}
                  onChange={(event) => handleEssayChange(question.id, event.target.value)}
                  placeholder="Digite sua resposta..."
                  required
                />
                <p className="text-right text-xs text-slate-500">
                  {(essayDrafts[question.id] ?? "").length}/{ESSAY_MAX} caracteres
                </p>
              </div>
            ) : (
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
            )}
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
          {questions.map((question) =>
            question.type === "ESSAY" ? (
              <textarea
                key={question.id}
                name={`essay_${question.id}`}
                defaultValue=""
                rows={1}
              />
            ) : (
              <input
                key={question.id}
                type="hidden"
                name={`q_${question.id}`}
                defaultValue=""
              />
            ),
          )}
        </form>
      ) : null}
    </div>
  );
}
