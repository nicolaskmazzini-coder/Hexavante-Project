"use server";

import { auth } from "@/auth";
import { equipStoreItem, purchaseStoreItem } from "@/services/shop.service";
import { revalidatePath } from "next/cache";

export type ShopActionResult = { success: boolean; error?: string };

export async function purchaseItemAction(
  _prev: ShopActionResult,
  formData: FormData,
): Promise<ShopActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para comprar itens." };
  }

  const storeItemId = formData.get("storeItemId");
  if (typeof storeItemId !== "string" || !storeItemId) {
    return { success: false, error: "Item inválido." };
  }

  try {
    await purchaseStoreItem(session.user.id, storeItemId);
    revalidatePath("/shop");
    revalidatePath("/inventario");
    revalidatePath("/perfil");
    revalidatePath("/simulados");
    revalidatePath("/pacotes-revisao");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao comprar item.",
    };
  }
}

export async function equipItemAction(
  _prev: ShopActionResult,
  formData: FormData,
): Promise<ShopActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Faça login para equipar itens." };
  }

  const inventoryId = formData.get("inventoryId");
  if (typeof inventoryId !== "string" || !inventoryId) {
    return { success: false, error: "Item inválido." };
  }

  try {
    await equipStoreItem(session.user.id, inventoryId);
    revalidatePath("/", "layout");
    revalidatePath("/shop");
    revalidatePath("/inventario");
    revalidatePath("/configuracoes/cosmeticos");
    revalidatePath("/perfil");
    revalidatePath("/simulados");
    revalidatePath("/pacotes-revisao");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao equipar item.",
    };
  }
}
