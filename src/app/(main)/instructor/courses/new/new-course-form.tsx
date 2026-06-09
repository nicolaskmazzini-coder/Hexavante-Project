"use client";

import { useActionState } from "react";
import { createCourseAction, type ActionResult } from "@/app/actions/course";
import { AppLink } from "@/components/ui/app-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  categories: { id: string; name: string }[];
};

const initialState: ActionResult = { success: false };

export function NewCourseForm({ categories }: Props) {
  const [state, formAction, pending] = useActionState(createCourseAction, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <div>
        <Label htmlFor="title">Título</Label>
        <Input id="title" name="title" required />
      </div>
      <div>
        <Label htmlFor="categoryId">Categoria</Label>
        <NativeSelect id="categoryId" name="categoryId" required defaultValue="">
          <option value="">Selecione...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div>
        <Label htmlFor="shortDescription">Descrição curta</Label>
        <Input id="shortDescription" name="shortDescription" />
      </div>
      <div>
        <Label htmlFor="description">Descrição completa</Label>
        <Textarea id="description" name="description" rows={4} />
      </div>
      <div>
        <Label htmlFor="thumbnailUrl">URL da thumbnail</Label>
        <Input
          id="thumbnailUrl"
          name="thumbnailUrl"
          type="url"
          placeholder="https://..."
        />
        <p className="mt-1 text-xs text-slate-500">
          Imagem de capa exibida no catálogo e na página do curso.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="level">Nível</Label>
          <NativeSelect id="level" name="level" defaultValue="BEGINNER">
            <option value="BEGINNER">Iniciante</option>
            <option value="INTERMEDIATE">Intermediário</option>
            <option value="ADVANCED">Avançado</option>
          </NativeSelect>
        </div>
        <div>
          <Label htmlFor="estimatedHours">Carga horária (h)</Label>
          <Input id="estimatedHours" name="estimatedHours" type="number" min={1} max={500} placeholder="Ex: 20" />
        </div>
        <div>
          <Label htmlFor="progressionType">Progressão</Label>
          <NativeSelect id="progressionType" name="progressionType" defaultValue="FREE">
            <option value="FREE">Livre</option>
            <option value="PROGRESSIVE">Progressiva</option>
          </NativeSelect>
        </div>
      </div>
      <p className="text-sm text-slate-500">
        Todos os cursos são gratuitos por enquanto. Pagamentos serão habilitados em versão futura.
      </p>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Criando..." : "Criar curso"}
        </Button>
        <AppLink href="/instructor/courses" muted className="inline-flex items-center rounded-lg border border-white/10 px-4 py-2 hover:border-sky-400/40 hover:bg-sky-400/10">
          Cancelar
        </AppLink>
      </div>
    </form>
  );
}
