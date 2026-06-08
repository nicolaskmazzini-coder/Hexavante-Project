import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const roles = [
  { name: "USER", description: "Estudante padrão" },
  { name: "INSTRUCTOR", description: "Cria cursos após aprovação" },
  { name: "MODERATOR", description: "Aprova instrutores e cursos" },
  { name: "ADMIN", description: "Administração geral" },
];

const categories = [
  { name: "ENEM", description: "Vestibulares e Preparatórios" },
  { name: "Vestibulares", description: "Vestibulares e Preparatórios" },
  { name: "Programação", description: "Tecnologia da Informação" },
  { name: "Desenvolvimento Web", description: "Tecnologia da Informação" },
  { name: "Banco de Dados", description: "Tecnologia da Informação" },
  { name: "Matemática", description: "Disciplinas Fundamentais" },
  { name: "Português", description: "Disciplinas Fundamentais" },
];

async function main() {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { description: cat.description },
      create: cat,
    });
  }

  const instructorRole = await prisma.role.findUnique({ where: { name: "INSTRUCTOR" } });
  const userRole = await prisma.role.findUnique({ where: { name: "USER" } });
  const progCategory = await prisma.category.findUnique({ where: { name: "Programação" } });

  if (!instructorRole || !userRole || !progCategory) {
    throw new Error("Seed incompleto: roles ou categorias não encontradas.");
  }

  const passwordHash = await bcrypt.hash("Instrutor123!", 12);

  const instructor = await prisma.user.upsert({
    where: { email: "instrutor@hexavante.com" },
    update: {},
    create: {
      username: "instrutor_demo",
      fullName: "Instrutor Demo",
      email: "instrutor@hexavante.com",
      passwordHash,
      birthDate: new Date("1995-01-15"),
      roles: {
        create: [{ roleId: userRole.id }, { roleId: instructorRole.id }],
      },
      xp: { create: {} },
      wallet: { create: {} },
    },
  });

  const existingCourse = await prisma.course.findUnique({
    where: { slug: "introducao-a-logica-de-programacao" },
  });

  if (!existingCourse) {
    await prisma.course.create({
      data: {
        title: "Introdução à Lógica de Programação",
        slug: "introducao-a-logica-de-programacao",
        categoryId: progCategory.id,
        shortDescription: "Aprenda os fundamentos da programação do zero.",
        description:
          "Curso introdutório com conceitos de variáveis, condicionais, laços e resolução de problemas. Ideal para iniciantes em TI.",
        courseType: "FREE",
        progressionType: "PROGRESSIVE",
        status: "APPROVED",
        instructors: {
          create: { userId: instructor.id },
        },
        modules: {
          create: [
            {
              title: "Primeiros passos",
              description: "Conceitos iniciais",
              orderNumber: 1,
              lessons: {
                create: [
                  {
                    title: "O que é programação?",
                    description: "Visão geral sobre lógica e algoritmos.",
                    videoUrl: "https://www.youtube.com/watch?v=8mei6uVttho",
                    videoProvider: "youtube",
                    duration: 600,
                    orderNumber: 1,
                  },
                  {
                    title: "Variáveis e tipos de dados",
                    description: "Como armazenar informações.",
                    videoUrl: "https://www.youtube.com/watch?v=3JfB0TuN06g",
                    videoProvider: "youtube",
                    duration: 720,
                    orderNumber: 2,
                  },
                ],
              },
              materials: {
                create: [
                  {
                    title: "Apostila - Lógica de Programação",
                    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    fileType: "pdf",
                  },
                ],
              },
            },
            {
              title: "Estruturas de controle",
              orderNumber: 2,
              lessons: {
                create: [
                  {
                    title: "Condicionais if/else",
                    videoUrl: "https://www.youtube.com/watch?v=6tNS--WetLI",
                    videoProvider: "youtube",
                    orderNumber: 1,
                  },
                ],
              },
            },
          ],
        },
      },
    });
  }

  const existingExam = await prisma.exam.findUnique({
    where: { slug: "logica-programacao-basica" },
  });

  if (!existingExam) {
    await prisma.exam.create({
      data: {
        title: "Simulado — Lógica de Programação",
        slug: "logica-programacao-basica",
        examType: "TECNOLOGIA",
        description:
          "Questões objetivas sobre algoritmos, variáveis, condicionais e estruturas de repetição.",
        timeLimit: 20,
        isPublished: true,
        questions: {
          create: [
            {
              statement: "O que é um algoritmo?",
              orderNumber: 1,
              alternatives: {
                create: [
                  { text: "Uma sequência finita de passos para resolver um problema", isCorrect: true },
                  { text: "Um tipo de linguagem de programação", isCorrect: false },
                  { text: "Um banco de dados relacional", isCorrect: false },
                  { text: "Um sistema operacional", isCorrect: false },
                ],
              },
            },
            {
              statement: "Qual estrutura é usada para repetir um bloco de código enquanto uma condição for verdadeira?",
              orderNumber: 2,
              alternatives: {
                create: [
                  { text: "while", isCorrect: true },
                  { text: "if", isCorrect: false },
                  { text: "switch", isCorrect: false },
                  { text: "return", isCorrect: false },
                ],
              },
            },
            {
              statement: "Em programação, uma variável serve para:",
              orderNumber: 3,
              alternatives: {
                create: [
                  { text: "Armazenar um valor na memória", isCorrect: true },
                  { text: "Compilar o código-fonte", isCorrect: false },
                  { text: "Conectar ao banco de dados", isCorrect: false },
                  { text: "Estilizar a interface do usuário", isCorrect: false },
                ],
              },
            },
            {
              statement: "Qual operador compara se dois valores são iguais em JavaScript?",
              orderNumber: 4,
              alternatives: {
                create: [
                  { text: "===", isCorrect: true },
                  { text: "=" , isCorrect: false },
                  { text: "=>", isCorrect: false },
                  { text: "&&", isCorrect: false },
                ],
              },
            },
            {
              statement: "O que significa 'debugging'?",
              orderNumber: 5,
              alternatives: {
                create: [
                  { text: "Encontrar e corrigir erros no código", isCorrect: true },
                  { text: "Publicar a aplicação em produção", isCorrect: false },
                  { text: "Criar o design da interface", isCorrect: false },
                  { text: "Fazer backup do banco de dados", isCorrect: false },
                ],
              },
            },
          ],
        },
      },
    });
  }

  const moderatorRole = await prisma.role.findUnique({ where: { name: "MODERATOR" } });

  if (moderatorRole && userRole) {
    const modPassword = await bcrypt.hash("Moderador123!", 12);
    await prisma.user.upsert({
      where: { email: "moderador@hexavante.com" },
      update: {},
      create: {
        username: "moderador_demo",
        fullName: "Moderador Demo",
        email: "moderador@hexavante.com",
        passwordHash: modPassword,
        birthDate: new Date("1990-05-20"),
        roles: {
          create: [{ roleId: userRole.id }, { roleId: moderatorRole.id }],
        },
        xp: { create: {} },
        wallet: { create: {} },
      },
    });
  }

  const demoCourse = await prisma.course.findUnique({
    where: { slug: "introducao-a-logica-de-programacao" },
  });

  if (userRole && demoCourse) {
    const directorPassword = await bcrypt.hash("Diretor123!", 12);
    const alunoPassword = await bcrypt.hash("Aluno123!", 12);

    const director = await prisma.user.upsert({
      where: { email: "diretor@hexavante.com" },
      update: {},
      create: {
        username: "diretor_demo",
        fullName: "Diretor Demo",
        email: "diretor@hexavante.com",
        passwordHash: directorPassword,
        birthDate: new Date("1985-03-10"),
        roles: { create: [{ roleId: userRole.id }] },
        xp: { create: {} },
        wallet: { create: {} },
      },
    });

    const aluno = await prisma.user.upsert({
      where: { email: "aluno@hexavante.com" },
      update: {},
      create: {
        username: "aluno_demo",
        fullName: "Aluno Demo",
        email: "aluno@hexavante.com",
        passwordHash: alunoPassword,
        birthDate: new Date("2006-08-15"),
        roles: { create: [{ roleId: userRole.id }] },
        xp: { create: {} },
        wallet: { create: {} },
      },
    });

    let school = await prisma.school.findFirst({
      where: { email: "escola@hexavante.com" },
    });

    if (!school) {
      school = await prisma.school.create({
        data: {
          name: "Escola Demo Hexavante",
          email: "escola@hexavante.com",
          phone: "(11) 99999-0000",
        },
      });
    }

    await prisma.schoolUser.upsert({
      where: {
        schoolId_userId: { schoolId: school.id, userId: director.id },
      },
      update: {},
      create: {
        schoolId: school.id,
        userId: director.id,
        institutionRole: "DIRECTOR",
      },
    });

    await prisma.schoolUser.upsert({
      where: {
        schoolId_userId: { schoolId: school.id, userId: instructor.id },
      },
      update: { institutionRole: "TEACHER" },
      create: {
        schoolId: school.id,
        userId: instructor.id,
        institutionRole: "TEACHER",
      },
    });

    await prisma.schoolUser.upsert({
      where: {
        schoolId_userId: { schoolId: school.id, userId: aluno.id },
      },
      update: {},
      create: {
        schoolId: school.id,
        userId: aluno.id,
        institutionRole: "STUDENT",
      },
    });

    let schoolCourse = await prisma.schoolCourse.findFirst({
      where: { schoolId: school.id, title: "Lógica de Programação" },
    });

    if (!schoolCourse) {
      schoolCourse = await prisma.schoolCourse.create({
        data: {
          schoolId: school.id,
          courseId: demoCourse.id,
          title: "Lógica de Programação",
          description: "Curso institucional vinculado ao curso da plataforma.",
        },
      });
    }

    let schoolClass = await prisma.schoolClass.findFirst({
      where: { schoolCourseId: schoolCourse.id, name: "Turma A - 2025.1" },
    });

    if (!schoolClass) {
      schoolClass = await prisma.schoolClass.create({
        data: {
          schoolCourseId: schoolCourse.id,
          name: "Turma A - 2025.1",
          semester: "2025.1",
        },
      });
    }

    await prisma.schoolClassTeacher.upsert({
      where: {
        classId_userId: { classId: schoolClass.id, userId: instructor.id },
      },
      update: {},
      create: { classId: schoolClass.id, userId: instructor.id },
    });

    const existingEnrollment = await prisma.schoolEnrollment.findUnique({
      where: {
        classId_userId: { classId: schoolClass.id, userId: aluno.id },
      },
    });

    if (!existingEnrollment) {
      await prisma.schoolEnrollment.create({
        data: { classId: schoolClass.id, userId: aluno.id },
      });

      await prisma.courseEnrollment.upsert({
        where: {
          userId_courseId: { userId: aluno.id, courseId: demoCourse.id },
        },
        update: {},
        create: { userId: aluno.id, courseId: demoCourse.id },
      });
    }
  }

  console.log("Seed concluído:");
  console.log("- Roles:", roles.map((r) => r.name).join(", "));
  console.log("- Categorias:", categories.length);
  console.log("- Instrutor demo: instrutor@hexavante.com / Instrutor123!");
  console.log("- Moderador demo: moderador@hexavante.com / Moderador123!");
  console.log("- Diretor demo: diretor@hexavante.com / Diretor123!");
  console.log("- Aluno demo: aluno@hexavante.com / Aluno123!");
  console.log("- Escola demo: /schools (Escola Demo Hexavante)");
  console.log("- Simulado demo: /simulados/logica-programacao-basica");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
