"use client";

import { useActionState } from "react";
import { createCourseAction, type ActionResult } from "@/app/actions/course";
import Link from "next/link";

type Props = {
  categories: { id: string; name: string }[];
};

const initialState: ActionResult = { success: false };

export function NewCourseForm({ categories }: Props) {
  const [state, formAction, pending] = useActionState(createCourseAction, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Título</label>
        <input
          name="title"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Categoria</label>
        <select
          name="categoryId"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">Selecione...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Descrição curta</label>
        <input
          name="shortDescription"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Descrição completa</label>
        <textarea
          name="description"
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Nível</label>
          <select
            name="level"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="BEGINNER">Iniciante</option>
            <option value="INTERMEDIATE">Intermediário</option>
            <option value="ADVANCED">Avançado</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Carga horária (h)</label>
          <input
            name="estimatedHours"
            type="number"
            min={1}
            max={500}
            placeholder="Ex: 20"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Progressão</label>
          <select
            name="progressionType"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="FREE">Livre</option>
            <option value="PROGRESSIVE">Progressiva</option>
          </select>
        </div>
      </div>
      <p className="text-sm text-slate-500">
        Todos os cursos são gratuitos por enquanto. Pagamentos serão habilitados em versão futura.
      </p>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? "Criando..." : "Criar curso"}
        </button>
        <Link
          href="/instructor/courses"
          className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
