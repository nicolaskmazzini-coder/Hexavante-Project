"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { updateProfilePhotoAction } from "@/app/actions/profile";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { resizeImageFile } from "@/lib/resize-image";

type Props = {
  currentAvatar?: string;
  borderClassName?: string | null;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export function ProfilePhotoUpload({ currentAvatar, borderClassName }: Props) {
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const preview = localPreview ?? currentAvatar ?? null;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const isAllowedType =
      ALLOWED_TYPES.includes(file.type) ||
      /\.(jpe?g|png|gif|webp)$/i.test(file.name);

    if (!isAllowedType) {
      setError("Use uma imagem PNG, JPG, GIF ou WebP.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("A imagem deve ter no máximo 5MB.");
      return;
    }

    const previousPreview = localPreview;
    const reader = new FileReader();
    reader.onload = (event) => setLocalPreview(event.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const resized = await resizeImageFile(file);
      const formData = new FormData();
      formData.append("file", resized);

      const result = await updateProfilePhotoAction(formData);
      if (!result.success) {
        setError(result.error || "Erro ao fazer upload da foto.");
        setLocalPreview(previousPreview);
        return;
      }

      if (result.avatarUrl) {
        setLocalPreview(result.avatarUrl);
      }
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Erro ao fazer upload da foto.");
      setLocalPreview(previousPreview);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="group relative">
        <Avatar
          src={preview}
          alt="Foto de perfil"
          size="xl"
          borderClassName={borderClassName}
          overlay={
            <button
              type="button"
              onClick={handleClick}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed"
              aria-label="Alterar foto de perfil"
            >
              <Camera className="h-8 w-8 text-white" />
            </button>
          }
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
        aria-label="Selecionar foto de perfil"
      />

      <Button onClick={handleClick} disabled={uploading} variant="outline" className="text-sm">
        {uploading ? "Enviando..." : "Alterar foto"}
      </Button>

      <p className="text-xs text-slate-500">PNG, JPG, GIF ou WebP (máx. 5MB)</p>

      {error && (
        <p className="max-w-56 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-center text-xs text-red-200">
          {error}
        </p>
      )}
    </div>
  );
}
