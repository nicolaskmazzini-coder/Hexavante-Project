// Importações necessárias para validação
import { z } from "zod"; // Biblioteca de validação de schemas

// Enum de papéis institucionais
const institutionRoleEnum = z.enum([
  "DIRECTOR",
  "ADMIN",
  "COORDINATOR",
  "TEACHER",
  "STUDENT",
]);

// Schema de validação para criação de escola
// Define regras para campos da escola
export const createSchoolSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().optional(),
});

// Schema de validação para adicionar membro
// Define regras para email e papel
export const addMemberSchema = z.object({
  email: z.string().email("E-mail inválido"),
  institutionRole: institutionRoleEnum,
});

// Schema de validação para criação de curso institucional
// Define regras para campos do curso
export const createSchoolCourseSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  courseId: z.string().optional(),
});

// Schema de validação para criação de turma
// Define regras para campos da turma
export const createSchoolClassSchema = z.object({
  name: z.string().min(2, "Nome da turma é obrigatório"),
  semester: z.string().optional(),
});

// Schema de validação para matricular aluno
// Define regras para seleção de aluno
export const enrollStudentSchema = z.object({
  userId: z.string().min(1, "Selecione um aluno"),
});

// Schema de validação para atribuir professor
// Define regras para seleção de professor
export const assignTeacherSchema = z.object({
  userId: z.string().min(1, "Selecione um professor"),
});

// Tipos inferidos dos schemas para uso no código
export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type CreateSchoolCourseInput = z.infer<typeof createSchoolCourseSchema>;
export type CreateSchoolClassInput = z.infer<typeof createSchoolClassSchema>;
