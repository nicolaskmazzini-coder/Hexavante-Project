// Importações necessárias para permissões de escola
import type { InstitutionRole } from "@prisma/client"; // Tipo de papel institucional

// Papéis que podem gerenciar a escola
const MANAGEMENT_ROLES: InstitutionRole[] = ["DIRECTOR", "ADMIN"];

// Papéis que podem gerenciar aspectos acadêmicos
const ACADEMIC_ROLES: InstitutionRole[] = ["DIRECTOR", "ADMIN", "COORDINATOR"];

// Função para verificar se papel pode gerenciar escola
// Retorna true se papel for DIRECTOR ou ADMIN
export function canManageSchool(role: InstitutionRole): boolean {
  return MANAGEMENT_ROLES.includes(role);
}

// Função para verificar se papel pode gerenciar aspectos acadêmicos
// Retorna true se papel for DIRECTOR, ADMIN ou COORDINADOR
export function canManageAcademics(role: InstitutionRole): boolean {
  return ACADEMIC_ROLES.includes(role);
}

// Função para verificar se papel pode atribuir professores
// Retorna true se papel for DIRECTOR, ADMIN ou COORDINADOR
export function canAssignTeachers(role: InstitutionRole): boolean {
  return ACADEMIC_ROLES.includes(role);
}

// Rótulos para papéis institucionais
export const INSTITUTION_ROLE_LABELS: Record<InstitutionRole, string> = {
  DIRECTOR: "Diretor",
  ADMIN: "Administrador",
  COORDINATOR: "Coordenador",
  TEACHER: "Professor",
  STUDENT: "Aluno",
};

// Papéis que podem ser atribuídos a membros (exclui DIRECTOR)
export const ASSIGNABLE_ROLES: InstitutionRole[] = [
  "ADMIN",
  "COORDINATOR",
  "TEACHER",
  "STUDENT",
];
