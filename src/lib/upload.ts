import { randomUUID } from "crypto";
import path from "path";

export const COURSE_COVER_MAX_BYTES = 5 * 1024 * 1024;
export const COURSE_COVER_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function getCourseCoverExtension(mime: string): string | null {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    default:
      return null;
  }
}

export function buildCourseCoverFilename(mime: string): string | null {
  const ext = getCourseCoverExtension(mime);
  if (!ext) return null;
  return `${randomUUID()}${ext}`;
}

export function isSafePublicUploadPath(url: string): boolean {
  return isSafePublicUploadPathInFolder(url, "courses");
}

export function isSafeExamCoverPath(url: string): boolean {
  return isSafePublicUploadPathInFolder(url, "exams");
}

function isSafePublicUploadPathInFolder(url: string, folder: string): boolean {
  const prefix = `/uploads/${folder}/`;
  if (!url.startsWith(prefix)) return false;
  const filename = path.posix.basename(url);
  return filename.length > 0 && !filename.includes("..");
}

export function buildExamCoverFilename(mime: string): string | null {
  return buildCourseCoverFilename(mime);
}

export function isSafeExamQuestionImagePath(url: string): boolean {
  return isSafePublicUploadPathInFolder(url, "exam-questions");
}

export function buildExamQuestionImageFilename(mime: string): string | null {
  return buildCourseCoverFilename(mime);
}
