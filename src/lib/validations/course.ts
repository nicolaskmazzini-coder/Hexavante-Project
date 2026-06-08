// Importações necessárias para validação
import { z } from "zod"; // Biblioteca de validação de schemas

// Schema de validação para curso
// Define regras para campos do curso
export const courseSchema = z.object({
  title: z.string().min(3, "Título muito curto").max(200),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  shortDescription: z.string().max(255).optional(),
  description: z.string().optional(),
  thumbnailUrl: z
    .string()
    .optional()
    .refine((v) => !v || v === "" || z.url().safeParse(v).success, "URL inválida"),
  courseType: z.enum(["FREE", "PAID", "PREMIUM"]).default("FREE"),
  progressionType: z.enum(["FREE", "PROGRESSIVE"]).default("FREE"),
});

// Schema de validação para módulo
// Define regras para campos do módulo
export const moduleSchema = z.object({
  title: z.string().min(2, "Título muito curto"),
  description: z.string().optional(),
  orderNumber: z.coerce.number().int().min(1),
});

// Schema de validação para aula
// Define regras para campos da aula
export const lessonSchema = z.object({
  title: z.string().min(2, "Título muito curto"),
  description: z.string().optional(),
  videoUrl: z
    .string()
    .optional()
    .refine((v) => !v || v === "" || z.url().safeParse(v).success, "URL do vídeo inválida"),
  videoProvider: z.enum(["youtube", "vimeo", "other"]).optional(),
  duration: z.coerce.number().int().min(0).optional(),
  orderNumber: z.coerce.number().int().min(1),
});

// Schema de validação para material
// Define regras para campos do material
export const materialSchema = z.object({
  title: z.string().min(2, "Título muito curto"),
  fileUrl: z.url("URL do arquivo inválida"),
  fileType: z.string().default("pdf"),
});

// Tipos inferidos dos schemas para uso no código
export type CourseInput = z.infer<typeof courseSchema>;
export type ModuleInput = z.infer<typeof moduleSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
export type MaterialInput = z.infer<typeof materialSchema>;
