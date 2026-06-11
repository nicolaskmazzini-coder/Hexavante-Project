export const EXAM_ALTERNATIVE_MIN = 2;
export const EXAM_ALTERNATIVE_MAX = 6;

export function indexToAlternativeLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

export function parseAlternativesFromFormData(formData: FormData): string[] {
  return formData
    .getAll("alternatives")
    .map((value) => String(value).trim())
    .filter((text) => text.length > 0);
}

export function getAlternativeLetters(count: number): string[] {
  return Array.from({ length: count }, (_, index) => indexToAlternativeLetter(index));
}
