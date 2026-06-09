// Importações necessárias para o serviço de cursos
import { prisma } from "@/lib/prisma"; // Cliente Prisma para banco de dados
import { slugify } from "@/lib/slug"; // Função para gerar slugs amigáveis
import type {
  CourseInput,
  LessonInput,
  MaterialInput,
  ModuleInput,
} from "@/lib/validations/course"; // Tipos de entrada para validação

// Função auxiliar para gerar slug único
// Adiciona número ao final se o slug já existir
async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "curso"; // Gera slug base do título
  let slug = base;
  let counter = 1;

  // Verifica se slug já existe e adiciona número se necessário
  while (await prisma.course.findUnique({ where: { slug } })) {
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}

// Função para listar cursos aprovados
// Retorna cursos com status APPROVED, opcionalmente filtrados por categoria
export async function listApprovedCourses(categoryId?: string) {
  return searchApprovedCourses({ categoryId });
}

export type CourseSearchParams = {
  categoryId?: string;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  q?: string;
  sort?: "recent" | "popular";
};

export async function searchApprovedCourses({
  categoryId,
  level,
  q,
  sort = "recent",
}: CourseSearchParams = {}) {
  const query = q?.trim();

  return prisma.course.findMany({
    where: {
      status: "APPROVED",
      ...(categoryId ? { categoryId } : {}),
      ...(level ? { level } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query } },
              { shortDescription: { contains: query } },
              { description: { contains: query } },
            ],
          }
        : {}),
    },
    include: {
      category: true,
      instructors: {
        include: {
          user: { select: { fullName: true, username: true } },
        },
      },
      _count: { select: { modules: true, enrollments: true } },
    },
    orderBy:
      sort === "popular"
        ? { enrollments: { _count: "desc" } }
        : { createdAt: "desc" },
  });
}

// Função para listar categorias de cursos
// Retorna todas as categorias ordenadas por nome
export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

// Função para obter curso aprovado pelo slug (páginas públicas)
export async function getApprovedCourseBySlug(slug: string) {
  return prisma.course.findFirst({
    where: { slug, status: "APPROVED" },
    include: {
      category: true,
      instructors: {
        include: {
          user: { select: { fullName: true, username: true } },
        },
      },
      modules: {
        orderBy: { orderNumber: "asc" },
        include: {
          lessons: { orderBy: { orderNumber: "asc" } },
          materials: true,
        },
      },
    },
  });
}

// Função para obter curso pelo slug
// Retorna curso com todos os dados incluindo módulos, aulas e materiais
export async function getCourseBySlug(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: {
      category: true,
      instructors: {
        include: {
          user: { select: { fullName: true, username: true } },
        },
      },
      modules: {
        orderBy: { orderNumber: "asc" }, // Ordena módulos por número
        include: {
          lessons: { orderBy: { orderNumber: "asc" } }, // Ordena aulas por número
          materials: true,
        },
      },
    },
  });
}

// Função para obter curso pelo ID
// Retorna curso com verificação se o usuário é instrutor
export async function getCourseById(id: string, userId?: string) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      category: true,
      instructors: true,
      modules: {
        orderBy: { orderNumber: "asc" },
        include: {
          lessons: { orderBy: { orderNumber: "asc" } },
          materials: true,
        },
      },
    },
  });

  if (!course) return null;

  // Verifica se o usuário é instrutor do curso
  const isInstructor = userId
    ? course.instructors.some((i) => i.userId === userId)
    : false;

  return { course, isInstructor };
}

// Função para listar cursos do instrutor
// Retorna todos os cursos onde o usuário é instrutor
export async function listInstructorCourses(userId: string) {
  return prisma.course.findMany({
    where: {
      instructors: { some: { userId } }, // Filtra cursos onde usuário é instrutor
    },
    include: {
      category: true,
      _count: { select: { modules: true, enrollments: true } },
    },
    orderBy: { updatedAt: "desc" }, // Ordena por data de atualização
  });
}

// Função para criar novo curso
// Cria curso com slug único e status PENDING_REVIEW
export async function createCourse(userId: string, data: CourseInput) {
  const slug = await uniqueSlug(data.title); // Gera slug único

  return prisma.course.create({
    data: {
      title: data.title,
      slug,
      categoryId: data.categoryId,
      shortDescription: data.shortDescription || null,
      description: data.description || null,
      thumbnailUrl: data.thumbnailUrl || null,
      courseType: "FREE",
      level: data.level,
      estimatedHours: data.estimatedHours ?? null,
      progressionType: data.progressionType,
      status: "PENDING_REVIEW", // Curso começa pendente de aprovação
      instructors: {
        create: { userId }, // Adiciona usuário como instrutor
      },
    },
  });
}

// Função para atualizar curso
// Atualiza apenas campos fornecidos, verifica permissão de instrutor
export async function updateCourse(
  courseId: string,
  userId: string,
  data: Partial<CourseInput>,
) {
  // Verifica se o usuário é instrutor do curso
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      instructors: { some: { userId } },
    },
  });

  if (!course) {
    throw new Error("Curso não encontrado ou sem permissão.");
  }

  const contentFieldsChanged =
    data.title !== undefined ||
    data.categoryId !== undefined ||
    data.shortDescription !== undefined ||
    data.description !== undefined ||
    data.thumbnailUrl !== undefined ||
    data.level !== undefined ||
    data.estimatedHours !== undefined ||
    data.progressionType !== undefined;

  const needsRemoderation = course.status === "APPROVED" && contentFieldsChanged;

  // Atualiza apenas os campos fornecidos
  return prisma.course.update({
    where: { id: courseId },
    data: {
      ...(data.title ? { title: data.title } : {}),
      ...(data.categoryId ? { categoryId: data.categoryId } : {}),
      ...(data.shortDescription !== undefined
        ? { shortDescription: data.shortDescription || null }
        : {}),
      ...(data.description !== undefined
        ? { description: data.description || null }
        : {}),
      ...(data.thumbnailUrl !== undefined
        ? { thumbnailUrl: data.thumbnailUrl || null }
        : {}),
      ...(data.level ? { level: data.level } : {}),
      ...(data.estimatedHours !== undefined
        ? { estimatedHours: data.estimatedHours ?? null }
        : {}),
      ...(data.progressionType ? { progressionType: data.progressionType } : {}),
      ...(needsRemoderation ? { status: "PENDING_REVIEW" } : {}),
    },
  });
}

// Função para adicionar módulo ao curso
// Verifica permissão de instrutor antes de criar módulo
export async function addModule(courseId: string, userId: string, data: ModuleInput) {
  await assertInstructor(courseId, userId); // Verifica se usuário é instrutor

  return prisma.module.create({
    data: {
      courseId,
      title: data.title,
      description: data.description || null,
      orderNumber: data.orderNumber,
    },
  });
}

// Função para adicionar aula ao módulo
// Verifica permissão de instrutor antes de criar aula
export async function addLesson(moduleId: string, userId: string, data: LessonInput) {
  // Busca módulo com curso e instrutores
  const courseModule = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: { include: { instructors: true } } },
  });

  // Verifica se módulo existe e se usuário é instrutor
  if (!courseModule || !courseModule.course.instructors.some((i) => i.userId === userId)) {
    throw new Error("Sem permissão para adicionar aula.");
  }

  return prisma.lesson.create({
    data: {
      moduleId,
      title: data.title,
      description: data.description || null,
      videoUrl: data.videoUrl || null,
      videoProvider: data.videoProvider || null,
      duration: data.duration ?? null,
      orderNumber: data.orderNumber,
    },
  });
}

// Função para adicionar material ao módulo
// Verifica permissão de instrutor antes de criar material
export async function addMaterial(
  moduleId: string,
  userId: string,
  data: MaterialInput,
) {
  // Busca módulo com curso e instrutores
  const courseModule = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: { include: { instructors: true } } },
  });

  // Verifica se módulo existe e se usuário é instrutor
  if (!courseModule || !courseModule.course.instructors.some((i) => i.userId === userId)) {
    throw new Error("Sem permissão para adicionar material.");
  }

  return prisma.material.create({
    data: {
      moduleId,
      title: data.title,
      fileUrl: data.fileUrl,
      fileType: data.fileType,
    },
  });
}

// Função auxiliar para verificar se usuário é instrutor do curso
// Lança erro se não for instrutor ou curso não existir
async function assertInstructor(courseId: string, userId: string) {
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      instructors: { some: { userId } },
    },
  });

  if (!course) {
    throw new Error("Curso não encontrado ou sem permissão.");
  }
}

// Função para contar total de aulas em módulos
// Soma o número de aulas em todos os módulos
export function countTotalLessons(
  modules: { lessons: unknown[] }[],
): number {
  return modules.reduce((acc, m) => acc + m.lessons.length, 0);
}

async function assertModuleInstructor(moduleId: string, userId: string) {
  const courseModule = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: { include: { instructors: true } } },
  });

  if (!courseModule || !courseModule.course.instructors.some((i) => i.userId === userId)) {
    throw new Error("Sem permissão para editar este módulo.");
  }

  return courseModule;
}

async function assertLessonInstructor(lessonId: string, userId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: { include: { course: { include: { instructors: true } } } },
    },
  });

  if (!lesson || !lesson.module.course.instructors.some((i) => i.userId === userId)) {
    throw new Error("Sem permissão para editar esta aula.");
  }

  return lesson;
}

export async function updateModule(
  moduleId: string,
  userId: string,
  data: Partial<ModuleInput>,
) {
  await assertModuleInstructor(moduleId, userId);

  return prisma.module.update({
    where: { id: moduleId },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description || null } : {}),
      ...(data.orderNumber !== undefined ? { orderNumber: data.orderNumber } : {}),
    },
  });
}

export async function deleteModule(moduleId: string, userId: string) {
  const courseModule = await assertModuleInstructor(moduleId, userId);
  await prisma.module.delete({ where: { id: moduleId } });
  return courseModule.courseId;
}

export async function updateLesson(
  lessonId: string,
  userId: string,
  data: Partial<LessonInput>,
) {
  await assertLessonInstructor(lessonId, userId);

  return prisma.lesson.update({
    where: { id: lessonId },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description || null } : {}),
      ...(data.videoUrl !== undefined ? { videoUrl: data.videoUrl || null } : {}),
      ...(data.videoProvider !== undefined ? { videoProvider: data.videoProvider || null } : {}),
      ...(data.duration !== undefined ? { duration: data.duration ?? null } : {}),
      ...(data.orderNumber !== undefined ? { orderNumber: data.orderNumber } : {}),
    },
  });
}

export async function deleteLesson(lessonId: string, userId: string) {
  const lesson = await assertLessonInstructor(lessonId, userId);
  await prisma.lesson.delete({ where: { id: lessonId } });
  return lesson.module.courseId;
}

export async function deleteMaterial(materialId: string, userId: string) {
  const material = await prisma.material.findUnique({
    where: { id: materialId },
    include: {
      module: { include: { course: { include: { instructors: true } } } },
    },
  });

  if (!material || !material.module.course.instructors.some((i) => i.userId === userId)) {
    throw new Error("Sem permissão para excluir este material.");
  }

  await prisma.material.delete({ where: { id: materialId } });
  return material.module.courseId;
}
