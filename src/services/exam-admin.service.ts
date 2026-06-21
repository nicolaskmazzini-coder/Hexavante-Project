import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import type { ExamAdminInput, ExamQuestionInput } from "@/lib/validations/exam";

async function uniqueExamSlug(title: string): Promise<string> {
  const base = slugify(title) || "simulado";
  let slug = base;
  let counter = 1;

  while (await prisma.exam.findUnique({ where: { slug } })) {
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}

export async function listExamsForAdmin() {
  return prisma.exam.findMany({
    include: {
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getExamForAdmin(examId: string) {
  return prisma.exam.findUnique({
    where: { id: examId },
    include: {
      questions: {
        orderBy: { orderNumber: "asc" },
        include: { alternatives: { orderBy: { id: "asc" } } },
      },
      _count: { select: { questions: true, attempts: true } },
    },
  });
}

export async function createExam(data: ExamAdminInput) {
  const slug = await uniqueExamSlug(data.title);

  return prisma.exam.create({
    data: {
      title: data.title,
      slug,
      examType: data.examType,
      description: data.description || null,
      coverImage: data.coverImage || null,
      timeLimit: data.timeLimit ?? null,
      isPublished: data.isPublished ?? false,
    },
  });
}

export async function updateExam(examId: string, data: Partial<ExamAdminInput>) {
  const coverUpdate =
    data.removeCover === true
      ? { coverImage: null }
      : data.coverImage !== undefined
        ? { coverImage: data.coverImage || null }
        : {};

  return prisma.exam.update({
    where: { id: examId },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.examType !== undefined ? { examType: data.examType } : {}),
      ...(data.description !== undefined ? { description: data.description || null } : {}),
      ...coverUpdate,
      ...(data.timeLimit !== undefined ? { timeLimit: data.timeLimit ?? null } : {}),
      ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
    },
  });
}

export async function deleteExam(examId: string) {
  await prisma.exam.delete({ where: { id: examId } });
}

export async function addExamQuestion(examId: string, data: ExamQuestionInput) {
  if (data.type === "ESSAY") {
    return prisma.examQuestion.create({
      data: {
        examId,
        statement: data.statement,
        imageUrl: data.imageUrl || null,
        imageWidth: data.imageUrl ? (data.imageWidth ?? null) : null,
        imageHeight: data.imageUrl ? (data.imageHeight ?? null) : null,
        imageDisplaySize: data.imageUrl ? (data.imageDisplaySize ?? "MEDIUM") : null,
        orderNumber: data.orderNumber,
        type: "ESSAY",
        expectedAnswer: data.expectedAnswer,
      },
    });
  }

  return prisma.examQuestion.create({
    data: {
      examId,
      statement: data.statement,
      imageUrl: data.imageUrl || null,
      imageWidth: data.imageUrl ? (data.imageWidth ?? null) : null,
      imageHeight: data.imageUrl ? (data.imageHeight ?? null) : null,
      imageDisplaySize: data.imageUrl ? (data.imageDisplaySize ?? "MEDIUM") : null,
      orderNumber: data.orderNumber,
      type: "MULTIPLE_CHOICE",
      alternatives: {
        create: data.alternatives.map((text, index) => ({
          text,
          isCorrect: String.fromCharCode(65 + index) === data.correctAlternative,
        })),
      },
    },
  });
}

export async function deleteExamQuestion(questionId: string) {
  await prisma.examQuestion.delete({ where: { id: questionId } });
}

export async function setExamPublished(examId: string, isPublished: boolean) {
  const exam = await prisma.exam.findUnique({ where: { id: examId }, select: { id: true } });
  if (!exam) throw new Error("Simulado não encontrado.");
  return prisma.exam.update({ where: { id: examId }, data: { isPublished } });
}
