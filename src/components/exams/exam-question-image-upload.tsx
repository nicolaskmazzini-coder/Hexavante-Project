"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { ExamQuestionImage } from "@/components/exams/exam-question-image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import {
  EXAM_QUESTION_IMAGE_SIZE_LABELS,
  EXAM_QUESTION_IMAGE_SIZES,
  type ExamQuestionImageSize,
} from "@/lib/exam-question-image";
import { FileImage, ImagePlus, Loader2, X } from "lucide-react";

export type ExamQuestionImageUploadResult = {
  url: string;
  width: number;
  height: number;
};

export type ExamQuestionImageUploadHandle = {
  uploadIfNeeded: () => Promise<ExamQuestionImageUploadResult | null>;
  isRemoved: () => boolean;
};

type Props = {
  initialUrl?: string | null;
  initialWidth?: number | null;
  initialHeight?: number | null;
  initialDisplaySize?: ExamQuestionImageSize | null;
  name?: string;
};

export const ExamQuestionImageUpload = forwardRef<ExamQuestionImageUploadHandle, Props>(
  function ExamQuestionImageUpload(
    {
      initialUrl,
      initialWidth,
      initialHeight,
      initialDisplaySize,
      name = "imageUrl",
    },
    ref,
  ) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl ?? null);
    const [naturalWidth, setNaturalWidth] = useState<number | null>(initialWidth ?? null);
    const [naturalHeight, setNaturalHeight] = useState<number | null>(initialHeight ?? null);
    const [displaySize, setDisplaySize] = useState<ExamQuestionImageSize>(
      initialDisplaySize ?? "MEDIUM",
    );
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [removed, setRemoved] = useState(false);
    const [savedUrl, setSavedUrl] = useState(initialUrl ?? "");
    const inputRef = useRef<HTMLInputElement>(null);
    const blobUrlRef = useRef<string | null>(null);

    const revokeBlobUrl = () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };

    useEffect(() => () => revokeBlobUrl(), []);

    const hasPreview = !removed && !!previewUrl;
    const hasDimensions = !!(naturalWidth && naturalHeight);

    useImperativeHandle(ref, () => ({
      isRemoved: () => removed,
      uploadIfNeeded: async () => {
        if (removed) return null;
        if (!pendingFile) {
          if (!previewUrl || !naturalWidth || !naturalHeight) return null;
          return { url: previewUrl, width: naturalWidth, height: naturalHeight };
        }

        setUploading(true);
        setError(null);

        try {
          const body = new FormData();
          body.append("file", pendingFile);

          const response = await fetch("/api/upload/exam-question-image", {
            method: "POST",
            body,
          });

          const data = (await response.json()) as {
            url?: string;
            width?: number;
            height?: number;
            error?: string;
          };

          if (!response.ok || !data.url || !data.width || !data.height) {
            throw new Error(data.error ?? "Falha no upload da imagem.");
          }

          revokeBlobUrl();
          setPreviewUrl(data.url);
          setSavedUrl(data.url);
          setNaturalWidth(data.width);
          setNaturalHeight(data.height);
          setPendingFile(null);

          return { url: data.url, width: data.width, height: data.height };
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

    const loadLocalDimensions = (objectUrl: string) => {
      const img = new window.Image();
      img.onload = () => {
        setNaturalWidth(img.naturalWidth);
        setNaturalHeight(img.naturalHeight);
      };
      img.onerror = () => {
        setError("Não foi possível carregar a imagem selecionada.");
        setNaturalWidth(null);
        setNaturalHeight(null);
      };
      img.src = objectUrl;
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setError(null);
      setRemoved(false);
      setPendingFile(file);
      setNaturalWidth(null);
      setNaturalHeight(null);

      revokeBlobUrl();
      const objectUrl = URL.createObjectURL(file);
      blobUrlRef.current = objectUrl;
      setPreviewUrl(objectUrl);
      loadLocalDimensions(objectUrl);
    };

    const handleRemove = () => {
      revokeBlobUrl();
      setPendingFile(null);
      setPreviewUrl(null);
      setNaturalWidth(null);
      setNaturalHeight(null);
      setSavedUrl("");
      setRemoved(true);
      setError(null);
      if (inputRef.current) inputRef.current.value = "";
    };

    return (
      <div className="space-y-3">
        <Label>Imagem da questão (opcional)</Label>

        <input type="hidden" name={name} value={removed ? "" : savedUrl} />
        <input
          type="hidden"
          name="imageWidth"
          value={removed || !naturalWidth ? "" : String(naturalWidth)}
        />
        <input
          type="hidden"
          name="imageHeight"
          value={removed || !naturalHeight ? "" : String(naturalHeight)}
        />
        <input type="hidden" name="imageDisplaySize" value={displaySize} />

        <div
          className={cn(
            "rounded-xl border border-white/10 bg-slate-950/40 p-3",
            !hasPreview && "flex h-28 items-center justify-center",
          )}
        >
          {hasPreview ? (
            hasDimensions ? (
              <ExamQuestionImage
                url={previewUrl}
                alt="Pré-visualização da imagem da questão"
                naturalWidth={naturalWidth}
                naturalHeight={naturalHeight}
                displaySize={displaySize}
                className="mt-0"
              />
            ) : (
              <div className="flex min-h-28 flex-col items-center justify-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Carregando pré-visualização"
                  className="max-h-56 max-w-full rounded-lg object-contain"
                />
                <span className="text-xs text-slate-500">Carregando dimensões...</span>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <FileImage className="h-8 w-8 text-teal-400/40" />
              <span className="text-sm">Diagrama, gráfico ou figura</span>
            </div>
          )}
        </div>

        {hasPreview && hasDimensions && (
          <div className="max-w-xs">
            <Label htmlFor="imageDisplaySize">Tamanho de exibição</Label>
            <NativeSelect
              id="imageDisplaySize"
              value={displaySize}
              onChange={(event) =>
                setDisplaySize(event.target.value as ExamQuestionImageSize)
              }
            >
              {EXAM_QUESTION_IMAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {EXAM_QUESTION_IMAGE_SIZE_LABELS[size]}
                </option>
              ))}
            </NativeSelect>
            <p className="mt-1 text-xs text-slate-500">
              A proporção original é mantida — a imagem não será distorcida.
            </p>
          </div>
        )}

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
            {hasPreview ? "Trocar imagem" : "Adicionar imagem"}
          </Button>
          {hasPreview && (
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
          JPEG, PNG ou WebP. Máximo 5 MB. Proporção original preservada (até 1920px).
        </p>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  },
);
