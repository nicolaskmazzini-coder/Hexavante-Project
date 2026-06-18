"use client";

import { useActionState } from "react";
import { resetPasswordAction, type PasswordResetResult } from "@/app/actions/password-reset";
import { AppLink } from "@/components/ui/app-link";
import { LinkButton } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";

const initialState: PasswordResetResult = { success: false };

type Props = {
  token: string;
};

export function ResetPasswordForm({ token }: Props) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  if (!token) {
    return (
      <Card className="w-full max-w-md p-8 text-center">
        <p className="text-slate-300">Link inválido. Solicite uma nova recuperação de senha.</p>
        <AppLink href="/recuperar-senha" className="mt-4 inline-block">
          Recuperar senha
        </AppLink>
      </Card>
    );
  }

  if (state.success) {
    return (
      <Card className="w-full max-w-md p-8 text-center shadow-2xl shadow-black/30">
        <p className="text-emerald-200">{state.message}</p>
        <LinkButton href="/login" className="mt-6">
          Ir para o login
        </LinkButton>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md p-8 shadow-2xl shadow-black/30 backdrop-blur">
      <h1 className="text-2xl font-black text-white">Nova senha</h1>
      <p className="mt-2 text-sm text-slate-400">
        Escolha uma senha segura com no mínimo 8 caracteres.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="token" value={token} />

        <div>
          <Label htmlFor="password">Nova senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className={cn(state.fieldErrors?.password && "border-red-400/50")}
          />
          {state.fieldErrors?.password && (
            <p className="mt-1 text-xs text-red-300">{state.fieldErrors.password}</p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            className={cn(state.fieldErrors?.confirmPassword && "border-red-400/50")}
          />
          {state.fieldErrors?.confirmPassword && (
            <p className="mt-1 text-xs text-red-300">{state.fieldErrors.confirmPassword}</p>
          )}
        </div>

        {state.error && (
          <p className="rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Salvando..." : "Redefinir senha"}
        </Button>
      </form>
    </Card>
  );
}
