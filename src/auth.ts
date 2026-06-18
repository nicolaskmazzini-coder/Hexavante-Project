import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { getAuthSecret, getOAuthCredentials, resolveOAuthEmail } from "@/lib/auth-env";
import { getSafeCallbackUrl, isPublicAuthRoute } from "@/lib/auth-routes";
import { authAdapter } from "@/lib/auth-adapter";
import { oauthProviders } from "@/lib/oauth";
import { loginSchema } from "@/lib/validations/auth";
import { getActiveModerationStatus } from "@/lib/moderation/status";
import { slimJwtToken } from "@/lib/jwt-slim";
import { prisma } from "@/lib/prisma";
import { ensureUserProvisioned, validateCredentials } from "@/services/auth.service";

const oauthCredentials = getOAuthCredentials();

function applyUserToToken(
  token: Record<string, unknown>,
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    username?: string;
    roles?: string[];
  },
) {
  token.sub = user.id;
  token.id = user.id;
  token.email = user.email ?? token.email;
  token.name = user.name ?? token.name;
  token.username = user.username;
  token.roles = user.roles ?? [];
  token.isImpersonating = false;
  token.impersonatorId = undefined;
  token.impersonatorUsername = undefined;
  token.impersonatorRoles = undefined;
  delete token.picture;
  delete token.image;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: authAdapter,
  secret: getAuthSecret(),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        return validateCredentials(parsed.data);
      },
    }),
    ...(oauthProviders.google
      ? [
          Google({
            clientId: oauthCredentials.googleId,
            clientSecret: oauthCredentials.googleSecret,
            // allowDangerousEmailAccountLinking removido: permite que conta Google
            // sobrescreva senha de conta existente com mesmo e-mail (risco de account takeover).
          }),
        ]
      : []),
    ...(oauthProviders.github
      ? [
          GitHub({
            clientId: oauthCredentials.githubId,
            clientSecret: oauthCredentials.githubSecret,
            // allowDangerousEmailAccountLinking removido por segurança.
            authorization: { params: { scope: "read:user user:email" } },
          }),
        ]
      : []),
  ],
  events: {
    async signIn({ user, account }) {
      if (!account?.provider || account.provider === "credentials" || !user.id) return;

      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!dbUser) return;

      await ensureUserProvisioned(dbUser.id);
      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          lastLogin: new Date(),
          provider: account.provider,
          providerId: account.providerAccountId,
          ...(user.image ? { avatarUrl: user.image } : {}),
        },
      });
    },
  },
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const pathname = nextUrl.pathname;
      const isLoggedIn = Boolean(session?.user?.id);

      if (isPublicAuthRoute(pathname)) {
        if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
          const destination = getSafeCallbackUrl(nextUrl.searchParams.get("callbackUrl"));
          return Response.redirect(new URL(destination, nextUrl));
        }
        return true;
      }

      return isLoggedIn;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider && account.provider !== "credentials") {
        const email = resolveOAuthEmail(user, profile);
        if (!email) return false;

        const dbUser = await prisma.user.findUnique({ where: { email } });
        if (dbUser) {
          const status = await getActiveModerationStatus(dbUser.id);
          if (status.isBanned) return false;
        }

        return true;
      }

      return true;
    },
    async jwt({ token, user }) {
      // Prisma só no sign-in (Node). No middleware (Edge) usar valores já no token.
      if (user?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { roles: { include: { role: true } } },
        });

        if (dbUser) {
          applyUserToToken(token, {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.fullName,
            username: dbUser.username,
            roles: dbUser.roles.map((r) => r.role.name),
          });
        } else if ("username" in user && Array.isArray(user.roles)) {
          applyUserToToken(token, {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username as string,
            roles: user.roles as string[],
          });
        }

        if (token.id && !token.isImpersonating) {
          const status = await getActiveModerationStatus(token.id as string);
          token.isBanned = status.isBanned;
          token.banReason = status.banReason;
          token.isMuted = status.isMuted;
        }
      }

      delete token.picture;
      delete token.image;

      return slimJwtToken(token);
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.email = (token.email as string | null | undefined) ?? session.user.email;
        session.user.name = (token.name as string | null | undefined) ?? session.user.name;
        session.user.username = (token.username as string) ?? "";
        session.user.roles = (token.roles as string[]) ?? [];
        session.user.image = null;
        session.user.isBanned = Boolean(token.isBanned);
        session.user.banReason = token.banReason as string | undefined;
        session.user.isMuted = Boolean(token.isMuted);
        session.user.isImpersonating = Boolean(token.isImpersonating);
        session.user.impersonatorUsername = token.impersonatorUsername as string | undefined;
      }
      return session;
    },
  },
});
