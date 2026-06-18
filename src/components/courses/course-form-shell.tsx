"use client";

import { useRef, useState } from "react";
import type { ActionResult } from "@/app/actions/course";
import {
  CourseCoverUpload,
  type CourseCoverUploadHandle,
} from "@/components/courses/course-cover-upload";
import { AppLink } from "@/components/ui/app-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  categories: { id: string; name: string }[];
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  initial?: {
    title?: string;
    categoryId?: string;
    shortDescription?: string | null;
    description?: string | null;
    coverImage?: string | null;
    thumbnailUrl?: string | null;
    level?: string;
    estimatedHours?: number | null;
    progressionType?: string;
  };
  submitLabel: string;
  cancelHref: string;
};

export function CourseFormShell({ categories, action, initial, submitLabel, cancelHref }: Props) {
  const coverRef = useRef<CourseCoverUploadHandle>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(false);

    try {
      const url = await coverRef.current?.uploadIfNeeded();
      const form = formRef.current;
      if (!form) return;

      const formData = new FormData(form);
      if (coverRef.current?.isRemoved()) {
        formData.set("coverImage", "");
        formData.set("removeCover", "true");
      } else if (url) {
        formData.set("coverImage", url);
        formData.set("removeCover", "false");
      }

      const result = await action({ success: false }, formData);
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess(true);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erro ao salvar curso.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <CourseCoverUpload ref={coverRef} initialUrl={initial?.coverImage ?? initial?.thumbnailUrl} />

      <div>
        <Label htmlFor="title">Título</Label>
        <Input id="title" name="title" required defaultValue={initial?.title} />
      </div>
      <div>
        <Label htmlFor="categoryId">Categoria</Label>
        <NativeSelect
          id="categoryId"
          name="categoryId"
          required
          defaultValue={initial?.categoryId ?? ""}
        >
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
        <Input
          id="shortDescription"
          name="shortDescription"
          defaultValue={initial?.shortDescription ?? ""}
        />
      </div>
      <div>
        <Label htmlFor="description">Descrição completa</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={initial?.description ?? ""}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="level">Nível</Label>
          <NativeSelect id="level" name="level" defaultValue={initial?.level ?? "BEGINNER"}>
            <option value="BEGINNER">Iniciante</option>
            <option value="INTERMEDIATE">Intermediário</option>
            <option value="ADVANCED">Avançado</option>
          </NativeSelect>
        </div>
        <div>
          <Label htmlFor="estimatedHours">Carga horária (h)</Label>
          <Input
            id="estimatedHours"
            name="estimatedHours"
            type="number"
            min={1}
            max={500}
            placeholder="Ex: 20"
            defaultValue={initial?.estimatedHours != null ? String(initial.estimatedHours) : ""}
          />
        </div>
        <div>
          <Label htmlFor="progressionType">Progressão</Label>
          <NativeSelect
            id="progressionType"
            name="progressionType"
            defaultValue={initial?.progressionType ?? "FREE"}
          >
            <option value="FREE">Livre</option>
            <option value="PROGRESSIVE">Progressiva</option>
          </NativeSelect>
        </div>
      </div>
      <p className="text-sm text-slate-500">
        Todos os cursos são gratuitos por enquanto. Pagamentos serão habilitados em versão futura.
      </p>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-emerald-400">Curso salvo com sucesso!</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : submitLabel}
        </Button>
        <AppLink
          href={cancelHref}
          muted
          className="inline-flex items-center rounded-lg border border-white/10 px-4 py-2 hover:border-sky-400/40 hover:bg-sky-400/10"
        >
          Cancelar
        </AppLink>
      </div>
    </form>
  );
}
