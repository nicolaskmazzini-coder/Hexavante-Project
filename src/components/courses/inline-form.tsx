"use client";

// Importações necessárias para o formulário inline
import { useActionState } from "react"; // Hook para gerenciar estado de ações do servidor
import type { ActionResult } from "@/app/actions/course"; // Tipo de resultado de ações

// Tipo para definir campos do formulário
type Field = {
  name: string; // Nome do campo
  label: string; // Rótulo do campo
  type?: string; // Tipo do input (text, textarea, etc)
  placeholder?: string; // Placeholder do input
  required?: boolean; // Se é obrigatório
  defaultValue?: string; // Valor padrão
  options?: { value: string; label: string }[]; // Opções para select
};

// Props do componente InlineForm
type InlineFormProps = {
  title: string; // Título do formulário
  fields: Field[]; // Lista de campos
  submitLabel: string; // Texto do botão de submit
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>; // Action do servidor
};

// Estado inicial do formulário
const initialState: ActionResult = { success: false };

// Componente de formulário inline reutilizável
// Gerencia estado de loading e erros, aplica tema azul e preto
export function InlineForm({ title, fields, submitLabel, action }: InlineFormProps) {
  // Hook para gerenciar estado da action do servidor
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <h4 className="mb-3 text-sm font-semibold text-white">{title}</h4>
      <form action={formAction} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
              <label className="mb-1 block text-xs font-medium text-slate-300">
                {field.label}
              </label>
              {field.options ? (
                <select
                  name={field.name}
                  defaultValue={field.defaultValue}
                  required={field.required ?? true}
                  className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
                >
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  defaultValue={field.defaultValue}
                  placeholder={field.placeholder}
                  rows={2}
                  className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
                />
              ) : (
                <input
                  name={field.name}
                  type={field.type ?? "text"}
                  defaultValue={field.defaultValue}
                  placeholder={field.placeholder}
                  required={field.required ?? true}
                  className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
                />
              )}
            </div>
          ))}
        </div>
        {state.error && (
          <p className="text-sm text-red-400">{state.error}</p>
        )}
        {state.success && (
          <p className="text-sm text-emerald-400">Salvo com sucesso!</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8] disabled:opacity-60"
        >
          {pending ? "Salvando..." : submitLabel}
        </button>
      </form>
    </div>
  );
}
