// Importações necessárias para validação
import { z } from "zod"; // Biblioteca de validação de schemas

// Schema de validação para submissão de simulado
// Define regras para tentativa e respostas
export const submitExamSchema = z.object({
  attemptId: z.string().min(1),
  answers: z.record(z.string(), z.string().min(1, "Responda todas as questões")),
});

// Tipo inferido do schema para uso no código
export type SubmitExamInput = z.infer<typeof submitExamSchema>;

// Rótulos para tipos de simulado
export const EXAM_TYPE_LABELS: Record<string, string> = {
  ENEM: "ENEM",
  VESTIBULAR: "Vestibular",
  TECNOLOGIA: "Tecnologia",
};
