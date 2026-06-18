// Função para extrair URL de embed do YouTube
// Converte URL do YouTube para formato de embed
export function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Trata URLs curtas do youtu.be
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    // Trata URLs normais do youtube.com
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

// Função para extrair URL de embed do Vimeo
// Converte URL do Vimeo para formato de embed
export function getVimeoEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

// Função genérica para obter URL de embed
// Tenta obter URL de embed baseado no provedor especificado
export function getVideoEmbedUrl(url: string, provider?: string | null): string | null {
  if (provider === "vimeo") return getVimeoEmbedUrl(url);
  if (provider === "youtube" || !provider) return getYoutubeEmbedUrl(url);
  // Tenta YouTube primeiro, depois Vimeo
  return getYoutubeEmbedUrl(url) ?? getVimeoEmbedUrl(url);
}
