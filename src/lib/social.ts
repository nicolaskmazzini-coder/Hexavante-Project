import type { SocialActivityType, ActivityReactionType } from "@prisma/client";

export type FeedEventMetadata = {
  course?: string;
  courseSlug?: string;
  simulado?: string;
  simuladoSlug?: string;
  score?: number;
  newLevel?: number;
  achievement?: string;
  days?: number;
  title?: string;
  body?: string;
};

export type FeedActivity = {
  id: string;
  type: SocialActivityType;
  metadata: FeedEventMetadata;
  tags: string[];
  acceptedCommentId: string | null;
  createdAt: Date;
  likes: number;
  comments: number;
  likedByViewer: boolean;
  reactions: Record<ActivityReactionType, number>;
  viewerReactions: ActivityReactionType[];
  user: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
  };
};

export type ActivityCommentView = {
  id: string;
  content: string;
  isAccepted: boolean;
  createdAt: Date;
  likes: number;
  likedByViewer: boolean;
  user: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
  };
};

export function formatEventText(type: SocialActivityType, metadata: FeedEventMetadata): string {
  switch (type) {
    case "COURSE_COMPLETED":
      return `Concluiu o curso "${metadata.course ?? "Curso"}" 🎓`;
    case "SIMULADO_PASSED":
      return `Passou no simulado "${metadata.simulado ?? "Simulado"}" com ${metadata.score ?? 0}% 🏆`;
    case "LEVEL_UP":
      return `Subiu para o nível ${metadata.newLevel ?? "?"} ✨`;
    case "ACHIEVEMENT":
      return `Desbloqueou a conquista "${metadata.achievement ?? "Conquista"}" 🏅`;
    case "STREAK":
      return `Manteve sequência de ${metadata.days ?? 0} dias 🔥`;
    case "DISCUSSION":
      return metadata.title ?? "Nova publicação na comunidade";
    default:
      return "Nova atividade na plataforma";
  }
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "agora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d atrás`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
