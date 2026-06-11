"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/app/actions/exam-grading";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  answerId: string;
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
};

const initialState: ActionResult = { success: false };

export function EssayGradeForm({ answerId, action }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-3 border-t border-white/10 pt-4">
      <input type="hidden" name="answerId" value={answerId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`status-${answerId}`}>Avaliação</Label>
          <NativeSelect id={`status-${answerId}`} name="status" defaultValue="CORRECT" required>
            <option value="CORRECT">Correto</option>
            <option value="PARTIAL">Parcialmente correto</option>
            <option value="INCORRECT">Incorreto</option>
          </NativeSelect>
        </div>
        <div>
          <Label htmlFor={`comment-${answerId}`}>Comentário (opcional)</Label>
          <Textarea id={`comment-${answerId}`} name="comment" rows={2} />
        </div>
      </div>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-400">Correção salva!</p>}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Salvando..." : "Salvar correção"}
      </Button>
    </form>
  );
}
