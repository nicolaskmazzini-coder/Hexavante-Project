import type { Adapter, AdapterUser } from "@auth/core/adapters";
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
  async createUser(user) {
    const userRole = await prisma.role.findUnique({ where: { name: "USER" } });
    if (!userRole) {
      throw new Error("Papel USER não encontrado. Execute o seed do banco.");
    }

    const email = user.email!;
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
};
