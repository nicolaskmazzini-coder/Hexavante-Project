"use client";

import { useActionState } from "react";
import {
  requestPasswordResetAction,
  type PasswordResetResult,
} from "@/app/actions/password-reset";
import { AppLink } from "@/components/ui/app-link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";

const initialState: PasswordResetResult = { success: false };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);

  return (
    <Card className="w-full max-w-md p-8 shadow-2xl shadow-black/30 backdrop-blur">
      <h1 className="text-2xl font-black text-white">Recuperar senha</h1>
      <p className="mt-2 text-sm text-slate-400">
        Informe o e-mail da sua conta. Enviaremos um link para redefinir a senha.
      </p>

      {state.success ? (
        <div className="mt-6 space-y-4">
          <p className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
            {state.message}
          </p>
          {state.devResetUrl && (
            <p className="break-all rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
              <span className="font-semibold">Dev:</span>{" "}
              <a href={state.devResetUrl} className="underline">
                {state.devResetUrl}
              </a>
            </p>
          )}
          <AppLink href="/login">← Voltar ao login</AppLink>
        </div>
      ) : (
        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              className={cn(state.fieldErrors?.email && "border-red-400/50")}
            />
            {state.fieldErrors?.email && (
              <p className="mt-1 text-xs text-red-300">{state.fieldErrors.email}</p>
            )}
          </div>

          {state.error && (
            <p className="rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Enviando..." : "Enviar link"}
          </Button>

          <p className="text-center text-sm text-slate-400">
            <AppLink href="/login">← Voltar ao login</AppLink>
          </p>
        </form>
      )}
    </Card>
  );
}
