"use client";

import { useActionState } from "react";
import { moderateCourseAction, type ActionResult } from "@/app/actions/moderation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const initialState: ActionResult = { success: false };

type Props = {
  courseId: string;
};

export function CourseModerationForm({ courseId }: Props) {
  const [state, formAction, pending] = useActionState(moderateCourseAction, initialState);

  return (
    <form action={formAction}>
      <Card padding="lg" className="space-y-4">
        <h3 className="font-semibold text-white">Decisão do moderador</h3>
        <input type="hidden" name="courseId" value={courseId} />

        <div>
          <Label htmlFor="status">Resultado</Label>
          <NativeSelect id="status" name="status" required defaultValue="APPROVED">
            <option value="APPROVED">Aprovar e publicar</option>
            <option value="REVISION_REQUIRED">Devolver para revisão</option>
            <option value="REJECTED">Rejeitar</option>
          </NativeSelect>
        </div>

        <div>
          <Label htmlFor="reviewNotes">Observações (opcional)</Label>
          <Textarea
            id="reviewNotes"
            name="reviewNotes"
            rows={3}
            placeholder="Feedback para o instrutor..."
          />
        </div>

        {state.error && <p className="text-sm text-red-400">{state.error}</p>}

        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Confirmar decisão"}
        </Button>
      </Card>
    </form>
  );
}
