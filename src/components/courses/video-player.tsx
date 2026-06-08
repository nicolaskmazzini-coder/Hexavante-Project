// Importações necessárias para o player de vídeo
import { getVideoEmbedUrl } from "@/lib/video"; // Função para gerar URL de embed

// Props do componente VideoPlayer
type VideoPlayerProps = {
  url: string; // URL do vídeo
  provider?: string | null; // Provedor do vídeo (YouTube, Vimeo, etc)
};

// Componente de player de vídeo
// Gera URL de embed e exibe iframe, aplica tema azul e preto para estado de erro
export function VideoPlayer({ url, provider }: VideoPlayerProps) {
  // Gera URL de embed a partir da URL original
  const embedUrl = getVideoEmbedUrl(url, provider);

  // Exibe mensagem de erro se URL for inválida
  if (!embedUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg bg-white/[0.04] text-slate-400">
        Vídeo não disponível ou URL inválida.
      </div>
    );
  }

  // Exibe iframe do vídeo
  return (
    <iframe
      src={embedUrl}
      title="Videoaula"
      className="aspect-video w-full rounded-lg"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}
