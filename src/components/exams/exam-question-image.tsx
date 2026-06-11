import Image from "next/image";
import { cn } from "@/lib/cn";
import {
  resolveQuestionImageDimensions,
  type ExamQuestionImageSize,
} from "@/lib/exam-question-image";

type Props = {
  url?: string | null;
  alt: string;
  naturalWidth?: number | null;
  naturalHeight?: number | null;
  displaySize?: ExamQuestionImageSize | null;
  className?: string;
  priority?: boolean;
};

function isBlobUrl(url: string) {
  return url.startsWith("blob:");
}

export function ExamQuestionImage({
  url,
  alt,
  naturalWidth,
  naturalHeight,
  displaySize,
  className,
  priority,
}: Props) {
  if (!url) return null;

  const unoptimized = isBlobUrl(url);

  if (!naturalWidth || !naturalHeight) {
    return (
      <div className={cn("mt-3", className)}>
        <Image
          src={url}
          alt={alt}
          width={480}
          height={360}
          unoptimized={unoptimized}
          className="h-auto max-h-80 w-full max-w-[480px] rounded-lg border border-white/10 bg-slate-950/40 object-contain"
          sizes="(max-width: 768px) 100vw, 480px"
          priority={priority}
        />
      </div>
    );
  }

  const { width, height, fullWidth } = resolveQuestionImageDimensions(
    displaySize ?? "MEDIUM",
    naturalWidth,
    naturalHeight,
  );

  return (
    <div className={cn("mt-3", className, fullWidth && "w-full")}>
      <Image
        src={url}
        alt={alt}
        width={width}
        height={height}
        unoptimized={unoptimized}
        className={cn(
          "rounded-lg border border-white/10 bg-slate-950/40 object-contain",
          fullWidth ? "h-auto max-h-[min(600px,80vh)] w-full" : "h-auto max-w-full",
        )}
        style={fullWidth ? undefined : { width, height }}
        sizes={fullWidth ? "(max-width: 768px) 100vw, 720px" : `${width}px`}
        priority={priority}
      />
    </div>
  );
}
