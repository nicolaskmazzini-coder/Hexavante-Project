"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/app/actions/exam-admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  examId: string;
  nextOrder: number;
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
};

const initialState: ActionResult = { success: false };

export function ExamQuestionForm({ examId, nextOrder, action }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <Card padding="md">
      <h3 className="mb-4 font-semibold text-white">Nova questão</h3>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="examId" value={examId} />
        <div>
          <Label htmlFor="statement">Enunciado</Label>
          <Textarea id="statement" name="statement" rows={3} required />
        </div>
        <div className="w-32">
          <Label htmlFor="orderNumber">Ordem</Label>
          <Input
            id="orderNumber"
            name="orderNumber"
            type="number"
            min={1}
            defaultValue={String(nextOrder)}
            required
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {(["A", "B", "C", "D"] as const).map((letter) => (
            <div key={letter}>
              <Label htmlFor={`alt${letter}`}>Alternativa {letter}</Label>
              <Input id={`alt${letter}`} name={`alt${letter}`} required />
            </div>
          ))}
        </div>
        <div className="w-48">
          <Label htmlFor="correctAlternative">Gabarito</Label>
          <NativeSelect id="correctAlternative" name="correctAlternative" defaultValue="A">
            <option value="A">Alternativa A</option>
            <option value="B">Alternativa B</option>
            <option value="C">Alternativa C</option>
            <option value="D">Alternativa D</option>
          </NativeSelect>
        </div>
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state.success && <p className="text-sm text-emerald-400">Questão adicionada!</p>}
        <Button type="submit" disabled={pending} size="sm">
          {pending ? "Salvando..." : "Adicionar questão"}
        </Button>
      </form>
    </Card>
  );
}
