"use client";

import { useActionState } from "react";
import { applyInstructorAction, type ActionResult } from "@/app/actions/moderation";
import { AppLink } from "@/components/ui/app-link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: ActionResult = { success: false };

export function InstructorApplyForm() {
  const [state, formAction, pending] = useActionState(applyInstructorAction, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <div>
        <Label htmlFor="motivation">Por que quer ser instrutor?</Label>
        <Textarea
          id="motivation"
          name="motivation"
          required
          rows={4}
          placeholder="Conte sua motivação e como pretende contribuir..."
        />
      </div>
      <div>
        <Label htmlFor="experience">Experiência</Label>
        <Textarea
          id="experience"
          name="experience"
          required
          rows={4}
          placeholder="Formação, áreas de atuação, cursos que já ministrou..."
        />
      </div>
      <div>
        <Label htmlFor="portfolioUrl">Portfólio (opcional)</Label>
        <Input id="portfolioUrl" name="portfolioUrl" type="url" placeholder="https://..." />
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && state.message && <Alert variant="success">{state.message}</Alert>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Enviando..." : "Enviar solicitação"}
        </Button>
        <AppLink
          href="/instructor/courses"
          muted
          className="inline-flex items-center rounded-lg border border-white/10 px-4 py-2 hover:border-sky-400/40 hover:bg-sky-400/10"
        >
          Voltar
        </AppLink>
      </div>
    </form>
  );
}
