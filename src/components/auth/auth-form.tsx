"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/app/actions/auth";

type Field = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
};

type AuthFormProps = {
  title: string;
  subtitle: string;
  fields: Field[];
  submitLabel: string;
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  footer?: React.ReactNode;
};

const initialState: ActionResult = { success: false };

export function AuthForm({
  title,
  subtitle,
  fields,
  submitLabel,
  action,
  footer,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.045] p-8 shadow-2xl shadow-black/30 backdrop-blur">
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">Hexavante</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-white">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
      </div>

      <form action={formAction} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="mb-1.5 block text-sm font-semibold text-slate-200">
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type ?? "text"}
              required={field.required ?? true}
              className="h-11 w-full rounded-lg border border-white/10 bg-slate-950/55/70 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/15"
            />
          </div>
        ))}

        {state.error && (
          <p className="rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:-translate-y-0.5 hover:bg-[#1d4ed8] disabled:translate-y-0 disabled:opacity-60"
        >
          {pending ? "Aguarde..." : submitLabel}
        </button>
      </form>

      {footer && <div className="mt-6 text-center text-sm text-slate-400">{footer}</div>}
    </div>
  );
}
