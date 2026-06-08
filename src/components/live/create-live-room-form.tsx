"use client";

import { useState } from "react";
import { CalendarClock, Link2, Radio, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CreateLiveRoomInput } from "@/lib/validations/live-room";

interface CreateLiveRoomFormProps {
  onSubmit: (data: CreateLiveRoomInput) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function CreateLiveRoomForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: CreateLiveRoomFormProps) {
  const [formData, setFormData] = useState<CreateLiveRoomInput>(() => ({
    title: "",
    description: "",
    courseId: "",
    videoUrl: "",
    videoProvider: "youtube",
    scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
    maxParticipants: undefined,
  }));

  const handleChange = (
    field: keyof CreateLiveRoomInput,
    value: string | Date | number | undefined,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
        <div className="mb-5 flex items-center gap-2">
          <Radio className="h-5 w-5 text-teal-300" />
          <h2 className="font-bold text-white">Informações da aula</h2>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-slate-200">
              Título da sala
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ex: Aula de matemática - funções"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-slate-200">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Resumo do conteúdo, objetivo da aula ou materiais necessários."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="courseId" className="text-sm font-semibold text-slate-200">
              Curso relacionado
            </Label>
            <Input
              id="courseId"
              value={formData.courseId}
              onChange={(e) => handleChange("courseId", e.target.value)}
              placeholder="ID do curso, se a aula fizer parte de uma trilha"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-5 flex items-center gap-2">
            <Link2 className="h-5 w-5 text-sky-300" />
            <h2 className="font-bold text-white">Vídeo</h2>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="videoUrl" className="text-sm font-semibold text-slate-200">
                URL do vídeo
              </Label>
              <Input
                id="videoUrl"
                value={formData.videoUrl}
                onChange={(e) => handleChange("videoUrl", e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoProvider" className="text-sm font-semibold text-slate-200">
                Provedor
              </Label>
              <select
                id="videoProvider"
                value={formData.videoProvider}
                onChange={(e) => handleChange("videoProvider", e.target.value)}
                className="flex h-10 w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white focus-visible:border-sky-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/15"
              >
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="other">Outro</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-5 flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-amber-300" />
            <h2 className="font-bold text-white">Agenda e capacidade</h2>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="scheduledAt" className="text-sm font-semibold text-slate-200">
                Data e hora da transmissão
              </Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={
                  formData.scheduledAt instanceof Date
                    ? formData.scheduledAt.toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) => handleChange("scheduledAt", new Date(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxParticipants" className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Users className="h-4 w-4 text-teal-300" />
                Limite de participantes
              </Label>
              <Input
                id="maxParticipants"
                type="number"
                min="1"
                max="1000"
                value={formData.maxParticipants || ""}
                onChange={(e) =>
                  handleChange(
                    "maxParticipants",
                    e.target.value ? parseInt(e.target.value) : undefined,
                  )
                }
                placeholder="Vazio para sem limite"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Criando..." : "Criar sala ao vivo"}
        </Button>
      </div>
    </form>
  );
}
