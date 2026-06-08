// Importações necessárias para o serviço de escolas
import type { InstitutionRole } from "@prisma/client"; // Tipo de papel institucional
import {
  canAssignTeachers,
  canManageAcademics,
  canManageSchool,
} from "@/lib/school-permissions"; // Funções de verificação de permissões
import type {
  AddMemberInput,
  CreateSchoolClassInput,
  CreateSchoolCourseInput,
  CreateSchoolInput,
} from "@/lib/validations/school"; // Tipos de entrada para validação
import { prisma } from "@/lib/prisma"; // Cliente Prisma para banco de dados
import { enrollInCourse } from "@/services/enrollment.service"; // Serviço de matrícula

// Função para listar escolas do usuário
// Retorna todas as escolas onde o usuário é membro
export async function listUserSchools(userId: string) {
  return prisma.schoolUser.findMany({
    where: { userId },
    include: { school: true },
    orderBy: { joinedAt: "desc" }, // Mais recentes primeiro
  });
}

// Função para obter membro da escola
// Retorna a associação do usuário com a escola
export async function getSchoolMembership(userId: string, schoolId: string) {
  return prisma.schoolUser.findUnique({
    where: {
      schoolId_userId: { schoolId, userId }, // Chave composta
    },
    include: { school: true },
  });
}

// Função para exigir membro da escola
// Retorna membro ou lança erro se não for membro
export async function requireMembership(userId: string, schoolId: string) {
  const membership = await getSchoolMembership(userId, schoolId);
  if (!membership) {
    throw new Error("Você não pertence a esta instituição.");
  }
  return membership;
}

// Função para criar escola
// Cria nova escola e adiciona usuário como diretor
export async function createSchool(userId: string, data: CreateSchoolInput) {
  return prisma.school.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      members: {
        create: {
          userId,
          institutionRole: "DIRECTOR", // Criador se torna diretor
        },
      },
    },
  });
}

// Função para obter dashboard da escola
// Retorna contagens de membros, cursos e turmas
export async function getSchoolDashboard(schoolId: string) {
  const [memberCount, courseCount, classCount] = await Promise.all([
    prisma.schoolUser.count({ where: { schoolId } }),
    prisma.schoolCourse.count({ where: { schoolId } }),
    prisma.schoolClass.count({
      where: { schoolCourse: { schoolId } },
    }),
  ]);

  return { memberCount, courseCount, classCount };
}

// Função para listar membros da escola
// Retorna todos os membros da escola
export async function listSchoolMembers(schoolId: string) {
  return prisma.schoolUser.findMany({
    where: { schoolId },
    include: {
      user: {
        select: { id: true, username: true, fullName: true, email: true },
      },
    },
    orderBy: { joinedAt: "asc" }, // Mais antigos primeiro
  });
}

// Função para adicionar membro à escola
// Adiciona usuário à escola com papel especificado
export async function addSchoolMember(
  actorRole: InstitutionRole,
  schoolId: string,
  data: AddMemberInput,
) {
  // Verifica permissão para gerenciar membros
  if (!canManageSchool(actorRole)) {
    throw new Error("Sem permissão para gerenciar membros.");
  }

  // Não permite adicionar outro diretor
  if (data.institutionRole === "DIRECTOR") {
    throw new Error("Não é possível adicionar outro diretor por aqui.");
  }

  // Busca usuário pelo email
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw new Error("Usuário não encontrado. O membro precisa ter conta na plataforma.");
  }

  // Verifica se usuário já é membro
  const existing = await prisma.schoolUser.findUnique({
    where: { schoolId_userId: { schoolId, userId: user.id } },
  });
  if (existing) {
    throw new Error("Este usuário já faz parte da instituição.");
  }

  // Cria novo membro
  return prisma.schoolUser.create({
    data: {
      schoolId,
      userId: user.id,
      institutionRole: data.institutionRole,
    },
    include: {
      user: {
        select: { id: true, username: true, fullName: true, email: true },
      },
    },
  });
}

// Função para remover membro da escola
// Remove membro da escola com verificações de segurança
export async function removeSchoolMember(
  actorRole: InstitutionRole,
  actorUserId: string,
  schoolId: string,
  memberId: string,
) {
  // Verifica permissão para remover membros
  if (!canManageSchool(actorRole)) {
    throw new Error("Sem permissão para remover membros.");
  }

  // Busca membro
  const member = await prisma.schoolUser.findFirst({
    where: { id: memberId, schoolId },
  });
  if (!member) {
    throw new Error("Membro não encontrado.");
  }

  // Não permite remover diretor
  if (member.institutionRole === "DIRECTOR") {
    throw new Error("Não é possível remover o diretor.");
  }

  // Não permite auto-remoção
  if (member.userId === actorUserId) {
    throw new Error("Você não pode remover a si mesmo.");
  }

  await prisma.schoolUser.delete({ where: { id: memberId } });
}

// Função para listar cursos institucionais
// Retorna todos os cursos da escola
export async function listSchoolCourses(schoolId: string) {
  return prisma.schoolCourse.findMany({
    where: { schoolId },
    include: {
      course: { select: { id: true, title: true, slug: true, status: true } },
      _count: { select: { classes: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Função para criar curso institucional
// Cria novo curso institucional, opcionalmente vinculado a curso da plataforma
export async function createSchoolCourse(
  actorRole: InstitutionRole,
  schoolId: string,
  data: CreateSchoolCourseInput,
) {
  // Verifica permissão para criar cursos
  if (!canManageAcademics(actorRole)) {
    throw new Error("Sem permissão para criar cursos institucionais.");
  }

  // Se vinculado a curso da plataforma, verifica se existe e está aprovado
  if (data.courseId) {
    const course = await prisma.course.findFirst({
      where: { id: data.courseId, status: "APPROVED" },
    });
    if (!course) {
      throw new Error("Curso da plataforma não encontrado ou não publicado.");
    }
  }

  // Cria curso institucional
  return prisma.schoolCourse.create({
    data: {
      schoolId,
      title: data.title,
      description: data.description || null,
      courseId: data.courseId || null,
    },
  });
}

// Função para obter curso institucional
// Retorna curso com turmas e contagens
export async function getSchoolCourse(schoolId: string, schoolCourseId: string) {
  return prisma.schoolCourse.findFirst({
    where: { id: schoolCourseId, schoolId },
    include: {
      course: { select: { id: true, title: true, slug: true, status: true } },
      classes: {
        include: {
          _count: { select: { enrollments: true, teachers: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

// Função para criar turma
// Cria nova turma para um curso institucional
export async function createSchoolClass(
  actorRole: InstitutionRole,
  schoolId: string,
  schoolCourseId: string,
  data: CreateSchoolClassInput,
) {
  // Verifica permissão para criar turmas
  if (!canManageAcademics(actorRole)) {
    throw new Error("Sem permissão para criar turmas.");
  }

  // Busca curso institucional
  const schoolCourse = await prisma.schoolCourse.findFirst({
    where: { id: schoolCourseId, schoolId },
  });
  if (!schoolCourse) {
    throw new Error("Curso institucional não encontrado.");
  }

  // Cria turma
  return prisma.schoolClass.create({
    data: {
      schoolCourseId,
      name: data.name,
      semester: data.semester || null,
    },
  });
}

// Função para obter turma
// Retorna turma com matrículas e professores
export async function getSchoolClass(schoolId: string, classId: string) {
  return prisma.schoolClass.findFirst({
    where: {
      id: classId,
      schoolCourse: { schoolId },
    },
    include: {
      schoolCourse: {
        include: {
          course: { select: { id: true, title: true, slug: true, status: true } },
          school: { select: { id: true, name: true } },
        },
      },
      enrollments: {
        include: {
          user: {
            select: { id: true, username: true, fullName: true, email: true },
          },
        },
        orderBy: { enrolledAt: "asc" },
      },
      teachers: {
        include: {
          user: {
            select: { id: true, username: true, fullName: true, email: true },
          },
        },
      },
    },
  });
}

// Função para matricular aluno em turma
// Matricula aluno na turma e no curso da plataforma se vinculado
export async function enrollStudentInClass(
  actorRole: InstitutionRole,
  schoolId: string,
  classId: string,
  studentUserId: string,
) {
  // Verifica permissão para matricular alunos
  if (!canManageAcademics(actorRole)) {
    throw new Error("Sem permissão para matricular alunos.");
  }

  // Busca turma
  const schoolClass = await getSchoolClass(schoolId, classId);
  if (!schoolClass) {
    throw new Error("Turma não encontrada.");
  }

  // Verifica se usuário é aluno da escola
  const studentMember = await prisma.schoolUser.findUnique({
    where: {
      schoolId_userId: { schoolId, userId: studentUserId },
    },
  });
  if (!studentMember || studentMember.institutionRole !== "STUDENT") {
    throw new Error("O usuário precisa ser aluno desta instituição.");
  }

  // Verifica se aluno já está matriculado
  const existing = await prisma.schoolEnrollment.findUnique({
    where: {
      classId_userId: { classId, userId: studentUserId },
    },
  });
  if (existing) {
    throw new Error("Aluno já matriculado nesta turma.");
  }

  // Cria matrícula na turma
  await prisma.schoolEnrollment.create({
    data: { classId, userId: studentUserId },
  });

  // Se turma está vinculada a curso da plataforma, matricula aluno também
  const platformCourseId = schoolClass.schoolCourse.courseId;
  if (platformCourseId) {
    await enrollInCourse(studentUserId, platformCourseId);
  }
}

// Função para atribuir professor à turma
// Atribui professor à turma com verificações
export async function assignTeacherToClass(
  actorRole: InstitutionRole,
  schoolId: string,
  classId: string,
  teacherUserId: string,
) {
  // Verifica permissão para atribuir professores
  if (!canAssignTeachers(actorRole)) {
    throw new Error("Sem permissão para atribuir professores.");
  }

  // Busca turma
  const schoolClass = await getSchoolClass(schoolId, classId);
  if (!schoolClass) {
    throw new Error("Turma não encontrada.");
  }

  // Verifica se usuário é professor da escola
  const teacherMember = await prisma.schoolUser.findUnique({
    where: {
      schoolId_userId: { schoolId, userId: teacherUserId },
    },
  });
  if (!teacherMember || teacherMember.institutionRole !== "TEACHER") {
    throw new Error("O usuário precisa ser professor desta instituição.");
  }

  // Verifica se professor já está atribuído
  const existing = await prisma.schoolClassTeacher.findUnique({
    where: {
      classId_userId: { classId, userId: teacherUserId },
    },
  });
  if (existing) {
    throw new Error("Professor já atribuído a esta turma.");
  }

  // Atribui professor à turma
  await prisma.schoolClassTeacher.create({
    data: { classId, userId: teacherUserId },
  });
}

// Função para listar turmas do aluno
// Retorna todas as turmas onde o aluno está matriculado
export async function listStudentClasses(userId: string, schoolId: string) {
  return prisma.schoolEnrollment.findMany({
    where: {
      userId,
      schoolClass: { schoolCourse: { schoolId } },
    },
    include: {
      schoolClass: {
        include: {
          schoolCourse: {
            include: {
              course: { select: { id: true, title: true, slug: true } },
            },
          },
          teachers: {
            include: {
              user: { select: { fullName: true, username: true } },
            },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });
}

// Função para listar turmas do professor
// Retorna todas as turmas onde o professor está atribuído
export async function listTeacherClasses(userId: string, schoolId: string) {
  return prisma.schoolClassTeacher.findMany({
    where: {
      userId,
      schoolClass: { schoolCourse: { schoolId } },
    },
    include: {
      schoolClass: {
        include: {
          schoolCourse: {
            include: {
              course: { select: { title: true, slug: true } },
            },
          },
          _count: { select: { enrollments: true } },
        },
      },
    },
  });
}

// Função para obter alunos da escola
// Retorna todos os usuários com papel STUDENT na escola
export async function getSchoolStudents(schoolId: string) {
  return prisma.schoolUser.findMany({
    where: { schoolId, institutionRole: "STUDENT" },
    include: {
      user: { select: { id: true, username: true, fullName: true, email: true } },
    },
  });
}

// Função para obter professores da escola
// Retorna todos os usuários com papel TEACHER na escola
export async function getSchoolTeachers(schoolId: string) {
  return prisma.schoolUser.findMany({
    where: { schoolId, institutionRole: "TEACHER" },
    include: {
      user: { select: { id: true, username: true, fullName: true, email: true } },
    },
  });
}
