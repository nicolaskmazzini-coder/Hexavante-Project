// Importações necessárias para o serviço de moderação
import { prisma } from "@/lib/prisma"; // Cliente Prisma para banco de dados
import type {
  CourseModerationInput,
  InstructorApplicationInput,
} from "@/lib/validations/moderation"; // Tipos de entrada para validação

// Função para obter última aplicação de instrutor do usuário
// Retorna a aplicação mais recente do usuário
export async function getLatestInstructorApplication(userId: string) {
  return prisma.instructorApplication.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" }, // Mais recente primeiro
  });
}

// Função para submeter aplicação de instrutor
// Cria nova aplicação se não houver pendência e usuário não for instrutor
export async function submitInstructorApplication(
  userId: string,
  data: InstructorApplicationInput,
) {
  // Verifica se já existe aplicação pendente
  const pending = await prisma.instructorApplication.findFirst({
    where: { userId, status: "PENDING" },
  });

  if (pending) {
    throw new Error("Você já possui uma solicitação pendente de análise.");
  }

  // Busca papéis do usuário
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true },
  });

  // Verifica se usuário já é instrutor
  if (userRoles.some((r) => r.role.name === "INSTRUCTOR")) {
    throw new Error("Você já é instrutor na plataforma.");
  }

  // Cria nova aplicação de instrutor
  return prisma.instructorApplication.create({
    data: {
      userId,
      motivation: data.motivation,
      experience: data.experience,
      portfolioUrl: data.portfolioUrl || null,
    },
  });
}

// Função para listar aplicações de instrutor pendentes
// Retorna todas as aplicações com status PENDING
export async function listPendingInstructorApplications() {
  return prisma.instructorApplication.findMany({
    where: { status: "PENDING" },
    include: {
      user: { select: { id: true, fullName: true, username: true, email: true } },
    },
    orderBy: { createdAt: "asc" }, // Mais antigas primeiro
  });
}

// Função para revisar aplicação de instrutor
// Aprova ou rejeita aplicação e atribui papel se aprovado
export async function reviewInstructorApplication(
  applicationId: string,
  moderatorId: string,
  approve: boolean,
) {
  // Busca aplicação
  const application = await prisma.instructorApplication.findUnique({
    where: { id: applicationId },
  });

  // Verifica se aplicação existe e está pendente
  if (!application || application.status !== "PENDING") {
    throw new Error("Solicitação não encontrada ou já analisada.");
  }

  // Busca papel de instrutor
  const instructorRole = await prisma.role.findUnique({ where: { name: "INSTRUCTOR" } });
  if (!instructorRole) throw new Error("Papel INSTRUCTOR não encontrado.");

  if (approve) {
    // Aprova aplicação e atribui papel de instrutor em transação
    await prisma.$transaction([
      prisma.instructorApplication.update({
        where: { id: applicationId },
        data: {
          status: "APPROVED",
          reviewedById: moderatorId,
          reviewedAt: new Date(),
        },
      }),
      prisma.userRole.upsert({
        where: {
          userId_roleId: { userId: application.userId, roleId: instructorRole.id },
        },
        create: {
          userId: application.userId,
          roleId: instructorRole.id,
          assignedBy: moderatorId,
        },
        update: {},
      }),
    ]);
  } else {
    // Rejeita aplicação
    await prisma.instructorApplication.update({
      where: { id: applicationId },
      data: {
        status: "REJECTED",
        reviewedById: moderatorId,
        reviewedAt: new Date(),
      },
    });
  }
}

// Função para listar cursos pendentes de moderação
// Retorna cursos com status PENDING_REVIEW
export async function listPendingCourses() {
  return prisma.course.findMany({
    where: { status: "PENDING_REVIEW" },
    include: {
      category: true,
      instructors: {
        include: { user: { select: { fullName: true, username: true, email: true } } },
      },
      _count: { select: { modules: true } },
    },
    orderBy: { updatedAt: "asc" }, // Mais antigos primeiro
  });
}

// Função para obter curso para moderação
// Retorna curso com todos os dados incluindo histórico de moderação
export async function getCourseForModeration(courseId: string) {
  return prisma.course.findUnique({
    where: { id: courseId },
    include: {
      category: true,
      instructors: {
        include: { user: { select: { fullName: true, username: true, email: true } } },
      },
      modules: {
        orderBy: { orderNumber: "asc" },
        include: {
          lessons: { orderBy: { orderNumber: "asc" } },
          materials: true,
        },
      },
      moderations: {
        orderBy: { reviewedAt: "desc" }, // Mais recentes primeiro
        take: 5, // Últimas 5 moderações
        include: {
          moderator: { select: { fullName: true } },
        },
      },
    },
  });
}

// Função para moderar curso
// Cria registro de moderação e atualiza status do curso
export async function moderateCourse(
  moderatorId: string,
  data: CourseModerationInput,
) {
  // Busca curso
  const course = await prisma.course.findUnique({ where: { id: data.courseId } });

  // Verifica se curso existe e está pendente
  if (!course || course.status !== "PENDING_REVIEW") {
    throw new Error("Curso não encontrado ou não está pendente de análise.");
  }

  // Cria moderação e atualiza status do curso em transação
  await prisma.$transaction([
    prisma.courseModeration.create({
      data: {
        courseId: data.courseId,
        moderatorId,
        status: data.status,
        reviewNotes: data.reviewNotes || null,
      },
    }),
    prisma.course.update({
      where: { id: data.courseId },
      data: { status: data.status },
    }),
  ]);
}

// Função para submeter curso para revisão
// Reenvia curso que foi rejeitado ou precisa de revisão
export async function submitCourseForReview(courseId: string, userId: string) {
  // Busca curso onde usuário é instrutor e status permite reenvio
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      instructors: { some: { userId } },
      status: { in: ["REVISION_REQUIRED", "REJECTED"] },
    },
  });

  if (!course) {
    throw new Error("Curso não encontrado ou não pode ser reenviado.");
  }

  // Atualiza status para PENDING_REVIEW
  return prisma.course.update({
    where: { id: courseId },
    data: { status: "PENDING_REVIEW" },
  });
}

// Função para obter contagens de moderação
// Retorna número de aplicações e cursos pendentes
export async function getModerationCounts() {
  const [pendingApplications, pendingCourses] = await Promise.all([
    prisma.instructorApplication.count({ where: { status: "PENDING" } }),
    prisma.course.count({ where: { status: "PENDING_REVIEW" } }),
  ]);
  return { pendingApplications, pendingCourses };
}

// Função para verificar se usuário tem papel de instrutor
// Retorna true se usuário for instrutor ou admin
export async function userHasInstructorRole(userId: string) {
  const roles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true },
  });
  return roles.some((r) => r.role.name === "INSTRUCTOR" || r.role.name === "ADMIN");
}
