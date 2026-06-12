"use server";

import { auth } from "@/auth";
import { activatePremiumTrial } from "@/services/premium.service";
import { revalidatePath } from "next/cache";

export type PremiumActionResult = { success: boolean; error?: string };

export async function activatePremiumTrialAction(): Promise<PremiumActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para assinar o Premium." };
  }

  try {
    await activatePremiumTrial(session.user.id);
    revalidatePath("/shop");
    revalidatePath("/perfil");
    revalidatePath("/simulados");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao ativar Premium.",
    };
  }
}
