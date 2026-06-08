"use client";

// Importações necessárias para o formulário de solicitação de instrutor
import { useActionState } from "react"; // Hook para gerenciar estado de ações do servidor
import { applyInstructorAction, type ActionResult } from "@/app/actions/moderation"; // Action para aplicar como instrutor
import Link from "next/link"; // Componente de link do Next.js

// Estado inicial do formulário
const initialState: ActionResult = { success: false };

// Componente de formulário para solicitar perfil de instrutor
// Gerencia estado de loading e erros, aplica tema azul e preto
export function InstructorApplyForm() {
  const [state, formAction, pending] = useActionState(applyInstructorAction, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Por que quer ser instrutor?</label>
        <textarea
          name="motivation"
          required
          rows={4}
          className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-white"
          placeholder="Conte sua motivação e como pretende contribuir..."
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Experiência</label>
        <textarea
          name="experience"
          required
          rows={4}
          className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-white"
          placeholder="Formação, áreas de atuação, cursos que já ministrou..."
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Portfólio (opcional)</label>
        <input
          name="portfolioUrl"
          type="url"
          placeholder="https://..."
          className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-white"
        />
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && state.message && (
        <p className="rounded-lg bg-emerald-900/20 border border-emerald-900/50 px-3 py-2 text-sm text-emerald-400">{state.message}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#2563eb] px-4 py-2 text-white hover:bg-[#1d4ed8] disabled:opacity-60"
        >
          {pending ? "Enviando..." : "Enviar solicitação"}
        </button>
        <Link href="/instructor/courses" className="rounded-lg border border-white/10 px-4 py-2 hover:bg-white/10 text-slate-300">
          Voltar
        </Link>
      </div>
    </form>
  );
}
