import type { Adapter, AdapterAccount, AdapterUser } from "@auth/core/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

async function uniqueUsername(base: string): Promise<string> {
  const normalized = slugify(base).slice(0, 28) || "usuario";
  let username = normalized;
  let counter = 1;

  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${normalized}${counter}`.slice(0, 30);
    counter++;
  }

  return username;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toAdapterUser(user: {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
}): AdapterUser {
  return {
    id: user.id,
    email: user.email,
    emailVerified: null,
    name: user.fullName,
    image: user.avatarUrl,
  };
}

const baseAdapter = PrismaAdapter(prisma) as Adapter;

export const authAdapter: Adapter = {
  ...baseAdapter,
  async getUser(id) {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? toAdapterUser(user) : null;
  },
  async getUserByEmail(email) {
    const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
    return user ? toAdapterUser(user) : null;
  },
  async getUserByAccount(providerAccountId) {
    const account = await prisma.account.findUnique({
      where: { provider_providerAccountId: providerAccountId },
      include: { user: true },
    });

    if (!account) return null;

    if (!account.user) {
      await prisma.account.delete({ where: { id: account.id } });
      return null;
    }

    return toAdapterUser(account.user);
  },
  async updateUser(user) {
    const data: {
      fullName?: string;
      avatarUrl?: string | null;
      email?: string;
    } = {};

    if (user.name) data.fullName = user.name;
    if (user.image !== undefined) data.avatarUrl = user.image;
    if (user.email) data.email = user.email;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
    });

    return toAdapterUser(updated);
  },
  async createUser(user) {
    const userRole = await prisma.role.findUnique({ where: { name: "USER" } });
    if (!userRole) {
      throw new Error("Papel USER não encontrado. Execute o seed do banco.");
    }

    if (!user.email) {
      throw new Error("Provedor OAuth não retornou e-mail. Verifique as permissões do app.");
    }

    const email = normalizeEmail(user.email);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return toAdapterUser(existing);
    }

    const username = await uniqueUsername(email.split("@")[0] ?? "usuario");

    const created = await prisma.user.create({
      data: {
        email,
        fullName: user.name?.trim() || username,
        username,
        birthDate: new Date("2000-01-01"),
        avatarUrl: user.image ?? null,
        provider: "oauth",
        roles: { create: { roleId: userRole.id } },
        xp: { create: {} },
        wallet: { create: {} },
      },
    });

    return toAdapterUser(created);
  },
  async linkAccount(account) {
    const user = await prisma.user.findUnique({ where: { id: account.userId } });
    if (!user) {
      throw new Error("Usuário não encontrado para vincular conta OAuth.");
    }

    const existing = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        },
      },
    });

    if (existing) {
      const linkedUser = await prisma.user.findUnique({ where: { id: existing.userId } });
      if (linkedUser) {
        return existing as AdapterAccount;
      }
      await prisma.account.delete({ where: { id: existing.id } });
    }

    return prisma.account.create({
      data: {
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state != null ? String(account.session_state) : null,
      },
    }) as unknown as AdapterAccount;
  },
};
