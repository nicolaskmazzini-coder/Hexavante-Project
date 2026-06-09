import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { authAdapter } from "@/lib/auth-adapter";
import { oauthProviders } from "@/lib/oauth";
import { loginSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma";
import { ensureUserProvisioned, validateCredentials } from "@/services/auth.service";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: authAdapter,
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
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
          }),
        ]
      : []),
    ...(oauthProviders.github
      ? [
          GitHub({
            clientId: process.env.AUTH_GITHUB_ID!,
            clientSecret: process.env.AUTH_GITHUB_SECRET!,
            authorization: { params: { scope: "read:user user:email" } },
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.id) return false;

      if (account?.provider && account.provider !== "credentials") {
        await ensureUserProvisioned(user.id);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLogin: new Date(),
            provider: account.provider,
            providerId: account.providerAccountId,
            ...(user.image ? { avatarUrl: user.image } : {}),
          },
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      const userId = user?.id ?? token.id;

      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId as string },
          include: { roles: { include: { role: true } } },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.username = dbUser.username;
          token.roles = dbUser.roles.map((r) => r.role.name);
          token.image = dbUser.avatarUrl ?? user?.image ?? token.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.roles = (token.roles as string[]) ?? [];
        session.user.image = token.image as string | null | undefined;
      }
      return session;
    },
  },
});
