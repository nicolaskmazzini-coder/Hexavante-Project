import { z } from "zod";

export const submitExamSchema = z.object({
  attemptId: z.string().min(1),
  answers: z.record(z.string(), z.string().min(1, "Responda todas as questões")),
});

export type SubmitExamInput = z.infer<typeof submitExamSchema>;

export const EXAM_TYPE_LABELS: Record<string, string> = {
  ENEM: "ENEM",
  VESTIBULAR: "Vestibular",
  TECNOLOGIA: "Tecnologia",
};

export const examAdminSchema = z.object({
  title: z.string().min(3, "Título muito curto"),
  examType: z.enum(["ENEM", "VESTIBULAR", "TECNOLOGIA"]),
  description: z.string().optional(),
  timeLimit: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number().int().min(1).max(300).optional(),
  ),
  isPublished: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

export type ExamAdminInput = z.infer<typeof examAdminSchema>;

export const examQuestionSchema = z.object({
  statement: z.string().min(5, "Enunciado muito curto"),
  orderNumber: z.coerce.number().int().min(1),
  altA: z.string().min(1, "Alternativa A obrigatória"),
  altB: z.string().min(1, "Alternativa B obrigatória"),
  altC: z.string().min(1, "Alternativa C obrigatória"),
  altD: z.string().min(1, "Alternativa D obrigatória"),
  correctAlternative: z.enum(["A", "B", "C", "D"]),
});

export type ExamQuestionInput = z.infer<typeof examQuestionSchema>;
