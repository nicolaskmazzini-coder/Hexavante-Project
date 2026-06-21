"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type OnboardingActionResult = { success: boolean; error?: string };

export async function completeOnboardingTourAction(): Promise<OnboardingActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para continuar." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingCompletedAt: new Date() },
  });

  revalidatePath("/");
  return { success: true };
}
