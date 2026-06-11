// Função para verificar se usuário tem um papel específico
// Retorna true se o papel estiver na lista de papéis
export function hasRole(roles: string[] | undefined, role: string): boolean {
  return roles?.includes(role) ?? false;
}

// Função para verificar se usuário é instrutor
// Retorna true se usuário for INSTRUCTOR ou ADMIN
export function isInstructor(roles: string[] | undefined): boolean {
  return hasRole(roles, "INSTRUCTOR") || hasRole(roles, "ADMIN");
}

// Função para verificar se usuário pode moderar
// Retorna true se usuário for MODERATOR ou ADMIN
export function canModerate(roles: string[] | undefined): boolean {
  return hasRole(roles, "MODERATOR") || hasRole(roles, "ADMIN");
}

export function isAdmin(roles: string[] | undefined): boolean {
  return hasRole(roles, "ADMIN");
}

// Rótulos para status de cursos
export const COURSE_STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: "Aguardando análise",
  APPROVED: "Publicado",
  REJECTED: "Rejeitado",
  REVISION_REQUIRED: "Revisão solicitada",
};

// Rótulos para status de aplicações
export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
};
