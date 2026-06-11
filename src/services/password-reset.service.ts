import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const RESET_PREFIX = "password-reset:";
const TOKEN_TTL_MS = 60 * 60 * 1000;

function resetIdentifier(email: string) {
  return `${RESET_PREFIX}${email.toLowerCase()}`;
}

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, email: true, passwordHash: true },
  });

  // Não revelar se o e-mail existe; retorna null para contas OAuth sem senha
  if (!user?.passwordHash) return null;

  const token = crypto.randomBytes(32).toString("hex");
  const identifier = resetIdentifier(user.email);

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier } }),
    prisma.verificationToken.create({
      data: {
        identifier,
        token,
        expires: new Date(Date.now() + TOKEN_TTL_MS),
      },
    }),
  ]);

  return token;
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || !record.identifier.startsWith(RESET_PREFIX)) {
    throw new Error("Link inválido ou expirado.");
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    throw new Error("Link expirado. Solicite uma nova redefinição.");
  }

  const email = record.identifier.slice(RESET_PREFIX.length);
  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { email },
      data: { passwordHash },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);
}
