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
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    ...(oauthProviders.github
      ? [
          GitHub({
            clientId: process.env.AUTH_GITHUB_ID!,
            clientSecret: process.env.AUTH_GITHUB_SECRET!,
            allowDangerousEmailAccountLinking: true,
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
    async signIn({ user, account }) {
      // OAuth: Auth.js chama signIn ANTES de criar o usuário no primeiro login.
      if (account?.provider && account.provider !== "credentials") {
        return Boolean(user.email);
      }

      return true;
    },
    async jwt({ token, user, account }) {
      const userId = user?.id ?? token.id;
      const email = user?.email ?? token.email;

      let dbUser =
        userId &&
        (await prisma.user.findUnique({
          where: { id: userId as string },
          include: { roles: { include: { role: true } } },
        }));

      if (!dbUser && email) {
        dbUser = await prisma.user.findUnique({
          where: { email: email as string },
          include: { roles: { include: { role: true } } },
        });
      }

      if (dbUser) {
        token.id = dbUser.id;
        token.email = dbUser.email;
        token.username = dbUser.username;
        token.roles = dbUser.roles.map((r) => r.role.name);
        token.image = dbUser.avatarUrl ?? user?.image ?? token.image;
      } else if (account?.provider && account.provider !== "credentials") {
        return token;
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
