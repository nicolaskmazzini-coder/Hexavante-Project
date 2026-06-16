import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SHOP_CATALOG } from "../src/lib/shop-catalog";

const prisma = new PrismaClient();

const roles = [
  { name: "USER", description: "Estudante padrão" },
  { name: "INSTRUCTOR", description: "Cria cursos após aprovação" },
  { name: "MODERATOR", description: "Aprova instrutores e cursos" },
  { name: "ADMIN", description: "Administração geral" },
  { name: "SUPERADMIN", description: "Controle total da plataforma" },
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
        level: "BEGINNER",
        estimatedHours: 12,
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
  const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });

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

  if (adminRole && userRole) {
    const adminPassword = await bcrypt.hash("Admin123!", 12);
    await prisma.user.upsert({
      where: { email: "admin@hexavante.com" },
      update: {},
      create: {
        username: "admin_demo",
        fullName: "Administrador Demo",
        email: "admin@hexavante.com",
        passwordHash: adminPassword,
        birthDate: new Date("1988-01-01"),
        roles: {
          create: [{ roleId: userRole.id }, { roleId: adminRole.id }],
        },
        xp: { create: {} },
        wallet: { create: {} },
      },
    });
  }

  const superAdminRole = await prisma.role.findUnique({ where: { name: "SUPERADMIN" } });
  if (superAdminRole && userRole) {
    const superPassword = await bcrypt.hash("Superadmin123!", 12);
    await prisma.user.upsert({
      where: { email: "superadmin@hexavante.com" },
      update: {},
      create: {
        username: "superadmin_demo",
        fullName: "Superadmin Demo",
        email: "superadmin@hexavante.com",
        passwordHash: superPassword,
        birthDate: new Date("1985-03-10"),
        roles: {
          create: [{ roleId: userRole.id }, { roleId: superAdminRole.id }],
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
    const alunoPassword = await bcrypt.hash("Aluno123!", 12);

    await prisma.user.upsert({
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

    await prisma.courseEnrollment.upsert({
      where: {
        userId_courseId: {
          userId: (
            await prisma.user.findUniqueOrThrow({ where: { email: "aluno@hexavante.com" } })
          ).id,
          courseId: demoCourse.id,
        },
      },
      update: {},
      create: {
        userId: (
          await prisma.user.findUniqueOrThrow({ where: { email: "aluno@hexavante.com" } })
        ).id,
        courseId: demoCourse.id,
      },
    });
  }

  for (const item of SHOP_CATALOG) {
    await prisma.storeItem.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        cost: item.cost,
        category: item.category,
        imageUrl: item.imageUrl ?? null,
        isPremiumOnly: item.isPremiumOnly ?? false,
        isPermanent: item.isPermanent ?? true,
        metadata: item.metadata ?? undefined,
        isActive: true,
      },
      create: {
        slug: item.slug,
        name: item.name,
        description: item.description,
        cost: item.cost,
        category: item.category,
        imageUrl: item.imageUrl ?? null,
        isPremiumOnly: item.isPremiumOnly ?? false,
        isPermanent: item.isPermanent ?? true,
        metadata: item.metadata ?? undefined,
      },
    });
  }

  const premiumExam = await prisma.exam.findUnique({
    where: { slug: "desafio-premium-logica-avancada" },
  });
  if (!premiumExam) {
    await prisma.exam.create({
      data: {
        title: "Desafio Premium — Lógica Avançada",
        slug: "desafio-premium-logica-avancada",
        examType: "TECNOLOGIA",
        description: "Simulado exclusivo para assinantes Premium com estatísticas avançadas.",
        isPremiumOnly: true,
        timeLimit: 45,
        questions: {
          create: [
            {
              statement: "Qual estrutura de dados usa LIFO?",
              orderNumber: 1,
              alternatives: {
                create: [
                  { text: "Pilha (Stack)", isCorrect: true },
                  { text: "Fila (Queue)", isCorrect: false },
                  { text: "Lista ligada", isCorrect: false },
                ],
              },
            },
            {
              statement: "Big-O de busca binária em array ordenado:",
              orderNumber: 2,
              alternatives: {
                create: [
                  { text: "O(log n)", isCorrect: true },
                  { text: "O(n)", isCorrect: false },
                  { text: "O(n log n)", isCorrect: false },
                ],
              },
            },
          ],
        },
      },
    });
  }

  const aluno = await prisma.user.findUnique({ where: { email: "aluno@hexavante.com" } });
  if (aluno) {
    await prisma.user.update({
      where: { id: aluno.id },
      data: { coins: 500 },
    });
    await prisma.userWallet.upsert({
      where: { userId: aluno.id },
      create: { userId: aluno.id, coins: 500 },
      update: { coins: 500 },
    });
  }

  console.log("Seed concluído:");
  console.log("- Roles:", roles.map((r) => r.name).join(", "));
  console.log("- Categorias:", categories.length);
  console.log("- Instrutor demo: instrutor@hexavante.com / Instrutor123!");
  console.log("- Moderador demo: moderador@hexavante.com / Moderador123!");
  console.log("- Admin demo: admin@hexavante.com / Admin123!");
  console.log("- Superadmin demo: superadmin@hexavante.com / Superadmin123!");
  console.log("- Aluno demo: aluno@hexavante.com / Aluno123!");
  console.log("- Simulado demo: /simulados/logica-programacao-basica");
  console.log("- Simulado Premium: /simulados/desafio-premium-logica-avancada");
  console.log("- Loja: /shop (aluno demo com 500 moedas)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
