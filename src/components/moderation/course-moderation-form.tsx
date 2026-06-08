"use client";

// Importações necessárias para o formulário de moderação de curso
import { useActionState } from "react"; // Hook para gerenciar estado de ações do servidor
import { moderateCourseAction, type ActionResult } from "@/app/actions/moderation"; // Action para moderar curso

// Estado inicial do formulário
const initialState: ActionResult = { success: false };

// Props do componente CourseModerationForm
type Props = {
  courseId: string; // ID do curso a ser moderado
};

// Componente de formulário para moderação de curso
// Permite aprovar, devolver para revisão ou rejeitar curso, aplica tema azul e preto
export function CourseModerationForm({ courseId }: Props) {
  const [state, formAction, pending] = useActionState(moderateCourseAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-white/10 bg-white/[0.04] p-6">
      <h3 className="font-semibold text-white">Decisão do moderador</h3>
      <input type="hidden" name="courseId" value={courseId} />

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Resultado</label>
        <select name="status" required className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-white">
          <option value="APPROVED">Aprovar e publicar</option>
          <option value="REVISION_REQUIRED">Devolver para revisão</option>
          <option value="REJECTED">Rejeitar</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Observações (opcional)</label>
        <textarea
          name="reviewNotes"
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-white"
          placeholder="Feedback para o instrutor..."
        />
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8] disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Confirmar decisão"}
      </button>
    </form>
  );
}
