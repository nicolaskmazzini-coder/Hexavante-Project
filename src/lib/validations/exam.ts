import {
  EXAM_ALTERNATIVE_MAX,
  EXAM_ALTERNATIVE_MIN,
  getAlternativeLetters,
} from "@/lib/exam-alternatives";
import { EXAM_QUESTION_IMAGE_SIZES } from "@/lib/exam-question-image";
import { z } from "zod";

export const submitExamSchema = z.object({
  attemptId: z.string().min(1),
  answers: z.record(z.string(), z.string()).default({}),
  essays: z.record(z.string(), z.string()).default({}),
});

export type SubmitExamInput = z.infer<typeof submitExamSchema>;

export const EXAM_TYPE_LABELS: Record<string, string> = {
  ENEM: "ENEM",
  VESTIBULAR: "Vestibular",
  TECNOLOGIA: "Tecnologia",
};

export const EXAM_QUESTION_TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: "Múltipla escolha",
  ESSAY: "Dissertativa",
};

export const examAdminSchema = z.object({
  title: z.string().min(3, "Título muito curto"),
  examType: z.enum(["ENEM", "VESTIBULAR", "TECNOLOGIA"]),
  description: z.string().optional(),
  coverImage: z
    .string()
    .optional()
    .refine(
      (v) => !v || v === "" || v.startsWith("/uploads/exams/") || z.url().safeParse(v).success,
      "URL de capa inválida",
    ),
  removeCover: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
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

const questionImageSchema = z
  .string()
  .optional()
  .refine(
    (v) =>
      !v || v === "" || v.startsWith("/uploads/exam-questions/") || z.url().safeParse(v).success,
    "URL de imagem inválida",
  );

const questionImageMetaSchema = {
  imageUrl: questionImageSchema,
  imageWidth: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number().int().min(1).optional(),
  ),
  imageHeight: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number().int().min(1).optional(),
  ),
  imageDisplaySize: z.enum(EXAM_QUESTION_IMAGE_SIZES).default("MEDIUM"),
};

const multipleChoiceQuestionSchema = z
  .object({
    type: z.literal("MULTIPLE_CHOICE"),
    statement: z.string().min(5, "Enunciado muito curto"),
    ...questionImageMetaSchema,
    orderNumber: z.coerce.number().int().min(1),
    alternatives: z
      .array(z.string().min(1, "Alternativa não pode ser vazia"))
      .min(EXAM_ALTERNATIVE_MIN, `Mínimo ${EXAM_ALTERNATIVE_MIN} alternativas`)
      .max(EXAM_ALTERNATIVE_MAX, `Máximo ${EXAM_ALTERNATIVE_MAX} alternativas`),
    correctAlternative: z.string().min(1, "Selecione o gabarito"),
  })
  .superRefine((data, ctx) => {
    const letters = getAlternativeLetters(data.alternatives.length);
    if (!letters.includes(data.correctAlternative)) {
      ctx.addIssue({
        code: "custom",
        message: "Gabarito inválido para o número de alternativas.",
        path: ["correctAlternative"],
      });
    }
  });

const essayQuestionSchema = z.object({
  type: z.literal("ESSAY"),
  statement: z.string().min(5, "Enunciado muito curto"),
  ...questionImageMetaSchema,
  orderNumber: z.coerce.number().int().min(1),
  expectedAnswer: z.string().min(3, "Informe o gabarito de referência"),
});

export const examQuestionSchema = z
  .discriminatedUnion("type", [multipleChoiceQuestionSchema, essayQuestionSchema])
  .superRefine((data, ctx) => {
    if (data.imageUrl && (!data.imageWidth || !data.imageHeight)) {
      ctx.addIssue({
        code: "custom",
        message: "Reenvie a imagem da questão para registrar as dimensões.",
        path: ["imageWidth"],
      });
    }
  });

export type ExamQuestionInput = z.infer<typeof examQuestionSchema>;

export const essayGradeSchema = z.object({
  answerId: z.string().min(1),
  status: z.enum(["CORRECT", "PARTIAL", "INCORRECT"]),
  comment: z.string().max(1000).optional(),
});

export type EssayGradeInput = z.infer<typeof essayGradeSchema>;
