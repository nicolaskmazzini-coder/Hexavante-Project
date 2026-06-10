"use client";

import { useState } from "react";
import { rejectInstructorAction } from "@/app/actions/moderation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  applicationId: string;
};

export function RejectInstructorForm({ applicationId }: Props) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-red-900/50 px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/10"
      >
        Rejeitar
      </button>
    );
  }

  return (
    <form
      className="w-full max-w-sm space-y-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const result = await rejectInstructorAction(applicationId, notes);
        if (!result.success) {
          setError(result.error ?? "Erro ao rejeitar");
          setPending(false);
          return;
        }
        window.location.reload();
      }}
    >
      <Textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={3}
        required
        placeholder="Motivo da rejeição para o candidato..."
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="danger" disabled={pending || notes.trim().length < 5}>
          {pending ? "Salvando..." : "Confirmar rejeição"}
        </Button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
