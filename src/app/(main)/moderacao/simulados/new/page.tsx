"use client";

import { useActionState } from "react";
import { createExamAction, type ActionResult } from "@/app/actions/exam-admin";
import { AppLink } from "@/components/ui/app-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { ClipboardList } from "lucide-react";

const initialState: ActionResult = { success: false };

export default function NewExamPage() {
  const [state, formAction, pending] = useActionState(createExamAction, initialState);

  return (
    <PageShell size="md">
      <AppLink href="/moderacao/simulados" muted className="mb-4 inline-flex items-center gap-1">
        ← Simulados
      </AppLink>

      <PageHeader
        badge="Moderação"
        icon={ClipboardList}
        title="Novo simulado"
        description="Defina as informações básicas e adicione questões na próxima etapa."
      />

      <form action={formAction} className="max-w-2xl space-y-4">
        <div>
          <Label htmlFor="title">Título</Label>
          <Input id="title" name="title" required />
        </div>
        <div>
          <Label htmlFor="examType">Tipo</Label>
          <NativeSelect id="examType" name="examType" defaultValue="TECNOLOGIA">
            <option value="ENEM">ENEM</option>
            <option value="VESTIBULAR">Vestibular</option>
            <option value="TECNOLOGIA">Tecnologia</option>
          </NativeSelect>
        </div>
        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea id="description" name="description" rows={3} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="timeLimit">Tempo limite (min)</Label>
            <Input id="timeLimit" name="timeLimit" type="number" min={1} max={300} placeholder="Ex: 60" />
          </div>
          <div>
            <Label htmlFor="isPublished">Status</Label>
            <NativeSelect id="isPublished" name="isPublished" defaultValue="false">
              <option value="false">Rascunho</option>
              <option value="true">Publicado</option>
            </NativeSelect>
          </div>
        </div>
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Criando..." : "Criar e adicionar questões"}
        </Button>
      </form>
    </PageShell>
  );
}
