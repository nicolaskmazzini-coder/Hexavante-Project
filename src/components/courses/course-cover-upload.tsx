"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";
import { BookOpen, ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";

export type CourseCoverUploadHandle = {
  uploadIfNeeded: () => Promise<string | null>;
  isRemoved: () => boolean;
};

type Props = {
  initialUrl?: string | null;
  name?: string;
};

export const CourseCoverUpload = forwardRef<CourseCoverUploadHandle, Props>(
  function CourseCoverUpload({ initialUrl, name = "coverImage" }, ref) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl ?? null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [removed, setRemoved] = useState(false);
    const [savedUrl, setSavedUrl] = useState(initialUrl ?? "");
    const inputRef = useRef<HTMLInputElement>(null);

    const displayUrl = removed ? null : previewUrl;

    useImperativeHandle(ref, () => ({
      isRemoved: () => removed,
      uploadIfNeeded: async () => {
        if (removed) return null;
        if (!pendingFile) return previewUrl;

        setUploading(true);
        setError(null);

        try {
          const body = new FormData();
          body.append("file", pendingFile);

          const response = await fetch("/api/upload/course-cover", {
            method: "POST",
            body,
          });

          const data = (await response.json()) as { url?: string; error?: string };
          if (!response.ok || !data.url) {
            throw new Error(data.error ?? "Falha no upload da capa.");
          }

          setPreviewUrl(data.url);
          setSavedUrl(data.url);
          setPendingFile(null);
          return data.url;
        } catch (uploadError) {
          const message =
            uploadError instanceof Error ? uploadError.message : "Erro ao enviar imagem.";
          setError(message);
          throw uploadError;
        } finally {
          setUploading(false);
        }
      },
    }));

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setError(null);
      setRemoved(false);
      setPendingFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    };

    const handleRemove = () => {
      setPendingFile(null);
      setPreviewUrl(null);
      setSavedUrl("");
      setRemoved(true);
      setError(null);
      if (inputRef.current) inputRef.current.value = "";
    };

    return (
      <div className="space-y-3">
        <Label>Imagem de capa</Label>

        <input type="hidden" name={name} value={removed ? "" : savedUrl} />
        <input type="hidden" name="removeCover" value={removed ? "true" : "false"} />

        <div
          className={cn(
            "relative overflow-hidden rounded-xl border border-white/10 bg-slate-950/40",
            displayUrl ? "aspect-video" : "flex h-40 items-center justify-center",
          )}
        >
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt="Pré-visualização da capa do curso"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 640px"
              unoptimized={displayUrl.startsWith("blob:")}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <BookOpen className="h-10 w-10 text-sky-400/40" />
              <span className="text-sm">Nenhuma capa selecionada</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            {displayUrl ? "Trocar imagem" : "Selecionar imagem"}
          </Button>
          {displayUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
              Remover
            </Button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        <p className="text-xs text-slate-500">
          JPEG, PNG ou WebP. Máximo 5 MB. Redimensionada para até 1280×720.
        </p>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  },
);
