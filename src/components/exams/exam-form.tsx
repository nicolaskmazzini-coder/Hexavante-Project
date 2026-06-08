"use client";

import { useActionState } from "react";
import { submitExamAction, type ActionResult } from "@/app/actions/exam";

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
};

const initialState: ActionResult = { success: false };

export function ExamForm({ slug, attemptId, title, questions }: ExamFormProps) {
  const [state, formAction, pending] = useActionState(submitExamAction, initialState);

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="attemptId" value={attemptId} />
      <input type="hidden" name="slug" value={slug} />

      {questions.map((question) => (
        <fieldset
          key={question.id}
          className="rounded-xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/15"
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
                />
                <span className="text-sm leading-6 text-slate-300">{alt.text}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      {state.error && (
        <p className="rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[#2563eb] px-4 py-3 font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-[#1d4ed8] disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Corrigindo..." : `Finalizar ${title}`}
      </button>
    </form>
  );
}
