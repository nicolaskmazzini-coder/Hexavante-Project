export const EXAM_QUESTION_IMAGE_SIZES = ["SMALL", "MEDIUM", "LARGE", "FULL"] as const;

export type ExamQuestionImageSize = (typeof EXAM_QUESTION_IMAGE_SIZES)[number];

export const EXAM_QUESTION_IMAGE_SIZE_LABELS: Record<ExamQuestionImageSize, string> = {
  SMALL: "Pequena (240px)",
  MEDIUM: "Média (480px)",
  LARGE: "Grande (720px)",
  FULL: "Largura total",
};

const DISPLAY_MAX_WIDTH: Record<Exclude<ExamQuestionImageSize, "FULL">, number> = {
  SMALL: 240,
  MEDIUM: 480,
  LARGE: 720,
};

export function resolveQuestionImageDimensions(
  size: ExamQuestionImageSize | null | undefined,
  naturalWidth: number,
  naturalHeight: number,
): { width: number; height: number; fullWidth: boolean } {
  const safeW = Math.max(1, naturalWidth);
  const safeH = Math.max(1, naturalHeight);
  const ratio = safeH / safeW;

  if (!size || size === "FULL") {
    return { width: safeW, height: safeH, fullWidth: true };
  }

  const maxWidth = DISPLAY_MAX_WIDTH[size];
  const width = Math.min(safeW, maxWidth);
  const height = Math.round(width * ratio);

  return { width, height, fullWidth: false };
}
