// Importações necessárias para validação
import { z } from "zod"; // Biblioteca de validação de schemas

// Schema de validação para aplicação de instrutor
// Define regras para campos da aplicação
export const instructorApplicationSchema = z.object({
  motivation: z.string().min(20, "Descreva sua motivação (mín. 20 caracteres)"),
  experience: z.string().min(20, "Descreva sua experiência (mín. 20 caracteres)"),
  portfolioUrl: z
    .string()
    .optional()
    .refine((v) => !v || v === "" || z.url().safeParse(v).success, "URL inválida"),
});

// Schema de validação para moderação de curso
// Define regras para campos da moderação
export const courseModerationSchema = z.object({
  courseId: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED", "REVISION_REQUIRED"]),
  reviewNotes: z.string().optional(),
});

// Tipos inferidos dos schemas para uso no código
export type InstructorApplicationInput = z.infer<typeof instructorApplicationSchema>;
export type CourseModerationInput = z.infer<typeof courseModerationSchema>;
