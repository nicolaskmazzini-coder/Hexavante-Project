"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Lock, Mail } from "lucide-react";
import type { ActionResult } from "@/app/actions/auth";
import { AppLink } from "@/components/ui/app-link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

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
  formKind: "login" | "register";
  embedded?: boolean;
};

const validationSchemas = {
  login: loginSchema,
  register: registerSchema,
} as const;

const initialState: ActionResult = { success: false };

const fieldIcons: Record<string, typeof Mail> = {
  email: Mail,
  password: Lock,
};

export function AuthForm({
  title,
  subtitle,
  fields,
  submitLabel,
  action,
  footer,
  callbackUrl = "/",
  formKind,
  embedded = false,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const fieldErrors = { ...clientErrors, ...state.fieldErrors };
  const pendingLabel = formKind === "login" ? "Entrando..." : "Aguarde...";

  useEffect(() => {
    if (state.success && state.redirectTo) {
      // Navegação completa garante que o cookie JWT do login por credenciais
      // esteja disponível antes do middleware avaliar a próxima rota.
      window.location.assign(state.redirectTo);
    }
  }, [state.success, state.redirectTo]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const validationSchema = validationSchemas[formKind];
    const raw = Object.fromEntries(
      fields.map((field) => [field.name, formData.get(field.name)]),
    );
    const parsed = validationSchema.safeParse(raw);

    if (!parsed.success) {
      event.preventDefault();
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !errors[key]) errors[key] = issue.message;
      }
      setClientErrors(errors);
      return;
    }

    setClientErrors({});
  };

  const formContent = (
    <>
      <div className={embedded ? "mb-6" : "mb-7"}>
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">Hexavante</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-white">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
      </div>

      <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        {fields.map((field) => {
          const Icon = formKind === "login" ? fieldIcons[field.name] : undefined;

          return (
            <div key={field.name}>
              <Label htmlFor={field.name}>{field.label}</Label>
              <div className={cn(Icon && "relative")}>
                {Icon ? (
                  <Icon
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                    aria-hidden="true"
                  />
                ) : null}
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type ?? "text"}
                  required={field.required ?? true}
                  aria-invalid={Boolean(fieldErrors[field.name])}
                  className={cn(
                    "h-11",
                    Icon && "pl-10",
                    fieldErrors[field.name] && "border-red-400/50 focus-visible:border-red-400/60",
                  )}
                />
              </div>
              {fieldErrors[field.name] && (
                <p className="mt-1 text-xs text-red-300">{fieldErrors[field.name]}</p>
              )}
              {formKind === "login" && field.name === "password" && (
                <p className="mt-2 text-right text-sm">
                  <AppLink href="/recuperar-senha">Esqueceu a senha?</AppLink>
                </p>
              )}
            </div>
          );
        })}

        {state.error && (
          <Alert variant={Object.keys(fieldErrors).length ? "warning" : "danger"}>{state.error}</Alert>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="mt-2 h-11 w-full"
          size="lg"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {pendingLabel}
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </form>

      {footer && <div className="mt-6 text-center text-sm text-slate-400">{footer}</div>}
    </>
  );

  if (embedded) {
    return <div className="w-full">{formContent}</div>;
  }

  return <Card className="w-full max-w-md p-8 shadow-2xl shadow-black/30 backdrop-blur">{formContent}</Card>;
}
