export type NavSession = {
  user: {
    id: string;
    username: string;
    roles: string[];
    image?: string | null;
  };
} | null;

export function toNavSession(
  session: {
    user?: {
      id?: string;
      username?: string;
      roles?: string[];
      image?: string | null;
    } | null;
  } | null,
  avatarUrl?: string | null,
): NavSession {
  if (!session?.user?.id || !session.user.username) return null;

  return {
    user: {
      id: session.user.id,
      username: session.user.username,
      roles: session.user.roles ?? [],
      image: avatarUrl ?? null,
    },
  };
}
