"use client";

import { useActionState } from "react";
import type { CourseStatus } from "@prisma/client";
import { moderateCourseAction, type ActionResult } from "@/app/actions/moderation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const initialState: ActionResult = { success: false };

type Props = {
  courseId: string;
  currentStatus: CourseStatus;
  returnTo?: string;
};

function defaultDecision(status: CourseStatus): CourseStatus {
  if (status === "PENDING_REVIEW") return "APPROVED";
  if (status === "APPROVED") return "REVISION_REQUIRED";
  return "APPROVED";
}

export function CourseModerationForm({ courseId, currentStatus, returnTo }: Props) {
  const [state, formAction, pending] = useActionState(moderateCourseAction, initialState);
  const isPendingReview = currentStatus === "PENDING_REVIEW";

  return (
    <form action={formAction}>
      <Card padding="lg" className="space-y-4">
        <h3 className="font-semibold text-white">
          {isPendingReview ? "Decisão do moderador" : "Alterar status do curso"}
        </h3>
        <input type="hidden" name="courseId" value={courseId} />
        {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}

        <div>
          <Label htmlFor="status">Resultado</Label>
          <NativeSelect id="status" name="status" required defaultValue={defaultDecision(currentStatus)}>
            {isPendingReview ? (
              <>
                <option value="APPROVED">Aprovar e publicar</option>
                <option value="REVISION_REQUIRED">Devolver para revisão</option>
                <option value="REJECTED">Rejeitar</option>
              </>
            ) : currentStatus === "APPROVED" ? (
              <>
                <option value="REVISION_REQUIRED">Despublicar (devolver para revisão)</option>
                <option value="REJECTED">Rejeitar curso</option>
              </>
            ) : (
              <>
                <option value="APPROVED">Aprovar e publicar</option>
                <option value="REVISION_REQUIRED">Manter em revisão</option>
                <option value="REJECTED">Rejeitar</option>
              </>
            )}
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
