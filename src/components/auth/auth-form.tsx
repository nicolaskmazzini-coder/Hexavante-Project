"use client";

import { useActionState, useState } from "react";
import type { z } from "zod";
import type { ActionResult } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";

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
  callbackUrl?: string;
  validationSchema?: z.ZodType<Record<string, unknown>>;
};

const initialState: ActionResult = { success: false };

export function AuthForm({
  title,
  subtitle,
  fields,
  submitLabel,
  action,
  footer,
  callbackUrl = "/",
  validationSchema,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const fieldErrors = { ...clientErrors, ...state.fieldErrors };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (validationSchema) {
      const raw = Object.fromEntries(
        fields.map((field) => [field.name, formData.get(field.name)]),
      );
      const parsed = validationSchema.safeParse(raw);
      if (!parsed.success) {
        const errors: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          const key = String(issue.path[0] ?? "");
          if (key && !errors[key]) errors[key] = issue.message;
        }
        setClientErrors(errors);
        return;
      }
    }

    setClientErrors({});
    formAction(formData);
  };

  return (
    <Card className="w-full max-w-md p-8 shadow-2xl shadow-black/30 backdrop-blur">
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">Hexavante</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-white">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        {fields.map((field) => (
          <div key={field.name}>
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              name={field.name}
              type={field.type ?? "text"}
              required={field.required ?? true}
              aria-invalid={Boolean(fieldErrors[field.name])}
              className={cn(fieldErrors[field.name] && "border-red-400/50 focus-visible:border-red-400/60")}
            />
            {fieldErrors[field.name] && (
              <p className="mt-1 text-xs text-red-300">{fieldErrors[field.name]}</p>
            )}
          </div>
        ))}

        {state.error && !Object.keys(fieldErrors).length && (
          <p className="rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {state.error}
          </p>
        )}

        {state.error && Object.keys(fieldErrors).length > 0 && (
          <p className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="mt-2 w-full" size="lg">
          {pending ? "Aguarde..." : submitLabel}
        </Button>
      </form>

      {footer && <div className="mt-6 text-center text-sm text-slate-400">{footer}</div>}
    </Card>
  );
}
