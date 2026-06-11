/**
 * Lê credenciais OAuth com suporte aos nomes do Auth.js v5 (AUTH_*)
 * e aliases legados (GOOGLE_CLIENT_ID, GITHUB_ID etc.).
 */
export function getOAuthCredentials() {
  return {
    googleId:
      process.env.AUTH_GOOGLE_ID?.trim() ||
      process.env.GOOGLE_CLIENT_ID?.trim() ||
      "",
    googleSecret:
      process.env.AUTH_GOOGLE_SECRET?.trim() ||
      process.env.GOOGLE_CLIENT_SECRET?.trim() ||
      "",
    githubId:
      process.env.AUTH_GITHUB_ID?.trim() ||
      process.env.GITHUB_ID?.trim() ||
      "",
    githubSecret:
      process.env.AUTH_GITHUB_SECRET?.trim() ||
      process.env.GITHUB_SECRET?.trim() ||
      "",
  };
}

export function getAuthBaseUrl(): string {
  return (
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "http://localhost:3000"
  );
}

export function getOAuthCallbackUrls(baseUrl = getAuthBaseUrl()) {
  const origin = baseUrl.replace(/\/$/, "");
  return {
    google: `${origin}/api/auth/callback/google`,
    github: `${origin}/api/auth/callback/github`,
  };
}

type OAuthProfile = Record<string, unknown>;

/** Auth.js chama signIn antes de criar o usuário; o e-mail pode vir só no profile. */
export function resolveOAuthEmail(
  user: { email?: string | null },
  profile?: OAuthProfile | null,
): string | null {
  if (user.email) return user.email;

  if (profile && typeof profile.email === "string" && profile.email) {
    return profile.email;
  }

  if (profile && Array.isArray(profile.emails)) {
    const emails = profile.emails as Array<{ email?: string; primary?: boolean }>;
    const primary = emails.find((entry) => entry.primary && entry.email);
    if (primary?.email) return primary.email;
    if (emails[0]?.email) return emails[0].email;
  }

  return null;
}

export function isSignInFailureResult(result: unknown): boolean {
  if (typeof result !== "string") return false;
  return result.includes("error=") || result.includes("/api/auth/error");
}
