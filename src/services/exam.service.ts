// Importações necessárias para o serviço de simulados
import type { Prisma } from "@prisma/client";
import { EXAM_PASS_SCORE } from "@/lib/gamification";
import { prisma } from "@/lib/prisma";
import { awardXp, XP_REWARDS } from "@/services/xp.service"; // Serviço de XP

export async function listPublishedExams(examType?: string) {
  return searchPublishedExams({ examType, sort: "recent" });
}

export type ExamSearchParams = {
  examType?: string;
  q?: string;
  sort?: "recent" | "popular";
};

export async function searchPublishedExams({
  examType,
  q,
  sort = "recent",
}: ExamSearchParams = {}) {
  const query = q?.trim();
  const type =
    examType === "ENEM" || examType === "VESTIBULAR" || examType === "TECNOLOGIA"
      ? examType
      : undefined;

  return prisma.exam.findMany({
    where: {
      isPublished: true,
      ...(type ? { examType: type } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query } },
              { description: { contains: query } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy:
      sort === "popular"
        ? { attempts: { _count: "desc" } }
        : { createdAt: "desc" },
  });
}

export async function getUserFinishedAttemptCounts(userId: string) {
  const rows = await prisma.examAttempt.groupBy({
    by: ["examId"],
    where: { userId, finishedAt: { not: null } },
    _count: { _all: true },
  });

  return Object.fromEntries(rows.map((row) => [row.examId, row._count._all]));
}

export async function getUserExamPerformance(userId: string, examId: string) {
  const attempts = await prisma.examAttempt.findMany({
    where: { userId, examId, finishedAt: { not: null } },
    select: { id: true, score: true, finishedAt: true },
    orderBy: { finishedAt: "desc" },
  });

  if (attempts.length === 0) {
    return {
      attemptCount: 0,
      bestScore: 0,
      averageScore: 0,
      recentAttempts: [] as typeof attempts,
    };
  }

  const scores = attempts.map((a) => a.score);
  return {
    attemptCount: attempts.length,
    bestScore: Math.max(...scores),
    averageScore: Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length),
    recentAttempts: attempts.slice(0, 5),
  };
}

// Função para obter simulado pelo slug
// Retorna simulado com questões, alternativas e contagem
export async function getExamBySlug(slug: string) {
  return prisma.exam.findUnique({
    where: { slug },
    include: {
      questions: {
        orderBy: { orderNumber: "asc" }, // Ordena questões por número
        include: { alternatives: { orderBy: { id: "asc" } } }, // Ordena alternativas por ID
      },
      _count: { select: { questions: true } }, // Conta questões
    },
  });
}

// Função para obter simulado para realização
// Retorna simulado publicado com questões e alternativas (sem indicar resposta correta)
export async function getExamForTaking(slug: string) {
  const exam = await prisma.exam.findUnique({
    where: { slug, isPublished: true },
    include: {
      questions: {
        orderBy: { orderNumber: "asc" },
        include: {
          alternatives: {
            select: { id: true, text: true }, // Não inclui isCorrect para não revelar resposta
            orderBy: { id: "asc" },
          },
        },
      },
    },
  });
  return exam;
}

// Função para iniciar tentativa de simulado
// Cria nova tentativa se simulado estiver disponível
export async function startAttempt(userId: string, examId: string) {
  // Busca simulado publicado com contagem de questões
  const exam = await prisma.exam.findFirst({
    where: { id: examId, isPublished: true },
    include: { _count: { select: { questions: true } } },
  });

  // Verifica se simulado existe e tem questões
  if (!exam || exam._count.questions === 0) {
    throw new Error("Simulado não disponível.");
  }

  // Cria nova tentativa
  return prisma.examAttempt.create({
    data: {
      examId,
      userId,
      totalQuestions: exam._count.questions,
    },
  });
}

// Função para obter tentativa ativa do usuário
// Retorna a tentativa mais recente que não foi finalizada
export async function getActiveAttempt(userId: string, examId: string) {
  return prisma.examAttempt.findFirst({
    where: {
      userId,
      examId,
      finishedAt: null, // Apenas tentativas não finalizadas
    },
    orderBy: { startedAt: "desc" }, // Mais recente primeiro
  });
}

// Função para submeter tentativa de simulado
// Corrige respostas, calcula pontuação e concede XP
export async function submitAttempt(
  userId: string,
  attemptId: string,
  answers: Record<string, string>,
  options?: { allowPartial?: boolean },
) {
  // Busca tentativa com simulado e questões
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        include: {
          questions: {
            include: { alternatives: true },
          },
        },
      },
    },
  });

  // Verifica se tentativa existe e pertence ao usuário
  if (!attempt || attempt.userId !== userId) {
    throw new Error("Tentativa não encontrada.");
  }

  // Verifica se tentativa já foi finalizada
  if (attempt.finishedAt) {
    throw new Error("Este simulado já foi finalizado.");
  }

  if (attempt.exam.timeLimit) {
    const elapsedMs = Date.now() - attempt.startedAt.getTime();
    const limitMs = attempt.exam.timeLimit * 60 * 1000;
    if (elapsedMs > limitMs) {
      throw new Error("Tempo esgotado para este simulado.");
    }
  }

  const questions = attempt.exam.questions;
  if (!options?.allowPartial && Object.keys(answers).length !== questions.length) {
    throw new Error("Responda todas as questões antes de enviar.");
  }

  let correct = 0;
  const answerRecords: {
    questionId: string;
    alternativeId: string;
    isCorrect: boolean;
  }[] = [];

  for (const question of questions) {
    let selectedId = answers[question.id];
    if (!selectedId && options?.allowPartial) {
      const fallback =
        question.alternatives.find((a) => !a.isCorrect) ?? question.alternatives[0];
      if (!fallback) continue;
      selectedId = fallback.id;
    }

    const selected = question.alternatives.find((a) => a.id === selectedId);

    if (!selected) {
      throw new Error("Resposta inválida detectada.");
    }

    const isCorrect = selected.isCorrect;
    if (isCorrect) correct++;

    answerRecords.push({
      questionId: question.id,
      alternativeId: selected.id,
      isCorrect,
    });
  }

  const total = questions.length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0; // Calcula pontuação em porcentagem

  // Salva respostas e atualiza tentativa em transação
  await prisma.$transaction([
    prisma.examAnswer.createMany({
      data: answerRecords.map((a) => ({
        attemptId,
        questionId: a.questionId,
        alternativeId: a.alternativeId,
        isCorrect: a.isCorrect,
      })),
    }),
    prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        correctAnswers: correct,
        score,
        finishedAt: new Date(),
      },
    }),
  ]);

  // Concede XP por finalizar simulado
  let xpEarned = 0;
  const examTitle = attempt.exam.title;
  const baseAward = await awardXp(
    userId,
    XP_REWARDS.EXAM,
    "EXAM",
    attemptId,
    `Simulado finalizado: ${examTitle}`,
  );
  if (baseAward) xpEarned += baseAward.amount;

  // Concede bônus de XP se aprovado
  if (score >= EXAM_PASS_SCORE) {
    const passAward = await awardXp(
      userId,
      XP_REWARDS.EXAM_PASS_BONUS,
      "EXAM",
      `${attemptId}-pass`,
      `Aprovado no simulado: ${examTitle}`,
    );
    if (passAward) xpEarned += passAward.amount;
  }

  return { attemptId, score, correct, total, xpEarned };
}

// Função para obter resultado da tentativa
// Retorna tentativa com respostas detalhadas
export async function getAttemptResult(userId: string, attemptId: string) {
  return prisma.examAttempt.findFirst({
    where: { id: attemptId, userId },
    include: {
      exam: true,
      answers: {
        include: {
          question: {
            include: {
              alternatives: { orderBy: { id: "asc" } },
            },
          },
          alternative: true,
        },
      },
    },
  });
}

// Função para listar tentativas do usuário
// Retorna todas as tentativas finalizadas do usuário
export async function listUserAttempts(userId: string) {
  return listUserAttemptsFiltered(userId, {});
}

export type AttemptHistoryParams = {
  examType?: string;
  page?: number;
  pageSize?: number;
};

export async function listUserAttemptsFiltered(
  userId: string,
  { examType, page = 1, pageSize = 10 }: AttemptHistoryParams,
) {
  const type =
    examType === "ENEM" || examType === "VESTIBULAR" || examType === "TECNOLOGIA"
      ? examType
      : undefined;

  const where: Prisma.ExamAttemptWhereInput = {
    userId,
    finishedAt: { not: null },
    ...(type ? { exam: { examType: type } } : {}),
  };

  const [attempts, total] = await Promise.all([
    prisma.examAttempt.findMany({
      where,
      include: { exam: true },
      orderBy: { finishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.examAttempt.count({ where }),
  ]);

  return { attempts, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getUserExamEvolution(userId: string, limit = 10) {
  const attempts = await prisma.examAttempt.findMany({
    where: { userId, finishedAt: { not: null } },
    select: { score: true, finishedAt: true, exam: { select: { title: true } } },
    orderBy: { finishedAt: "desc" },
    take: limit,
  });

  return attempts.reverse();
}

// Função para obter estatísticas do usuário
// Retorna total de tentativas, média e melhor pontuação
export async function getUserExamStats(userId: string) {
  const attempts = await prisma.examAttempt.findMany({
    where: { userId, finishedAt: { not: null } },
    select: { score: true, correctAnswers: true, totalQuestions: true },
  });

  // Retorna zeros se não houver tentativas
  if (attempts.length === 0) {
    return { totalAttempts: 0, averageScore: 0, bestScore: 0 };
  }

  // Calcula média e melhor pontuação
  const scores = attempts.map((a) => a.score);
  const averageScore = Math.round(
    scores.reduce((sum, s) => sum + s, 0) / scores.length,
  );
  const bestScore = Math.max(...scores);

  return { totalAttempts: attempts.length, averageScore, bestScore };
}
