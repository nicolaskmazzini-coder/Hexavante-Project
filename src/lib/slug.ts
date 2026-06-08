// Função para converter texto em slug amigável para URLs
// Remove acentos, converte para minúsculas e substitui espaços por hífens
export function slugify(text: string): string {
  return text
    .normalize("NFD") // Normaliza string para separar acentos
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .toLowerCase() // Converte para minúsculas
    .trim() // Remove espaços nas extremidades
    .replace(/[^a-z0-9]+/g, "-") // Substitui caracteres não alfanuméricos por hífens
    .replace(/^-+|-+$/g, ""); // Remove hífens no início e fim
}
