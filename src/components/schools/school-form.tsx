"use client";

// Importações necessárias para o formulário de escola
import { useActionState } from "react"; // Hook para gerenciar estado de ações do servidor
import type { ActionResult } from "@/app/actions/school"; // Tipo de resultado de ações

// Estado inicial do formulário
const initialState: ActionResult = { success: false };

// Props do componente SchoolForm
type Props = {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>; // Action do servidor
  submitLabel: string; // Texto do botão de submit
  children: React.ReactNode; // Campos do formulário
};

// Componente de formulário reutilizável para escolas
// Gerencia estado de loading e erros, aplica tema azul e preto
export function SchoolForm({ action, submitLabel, children }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-white/10 bg-white/[0.04] p-6">
      {children}
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-400">Salvo com sucesso!</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8] disabled:opacity-60"
      >
        {pending ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}
