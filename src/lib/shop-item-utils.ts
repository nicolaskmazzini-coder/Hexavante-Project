export type ShopOwnershipStatus =
  | "available"
  | "owned_permanent"
  | "active_temporary"
  | "expired_temporary";

export function isInventoryEntryActive(
  expiresAt: Date | string | null | undefined,
  now = new Date(),
): boolean {
  if (!expiresAt) return true;
  const expiry = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  return expiry > now;
}

export function getShopOwnershipStatus(
  isPermanent: boolean,
  entry: { expiresAt: Date | string | null } | null | undefined,
  now = new Date(),
): ShopOwnershipStatus {
  if (!entry) return "available";
  if (isPermanent) return "owned_permanent";
  if (isInventoryEntryActive(entry.expiresAt, now)) return "active_temporary";
  return "expired_temporary";
}

export function canRepurchaseTemporaryItem(status: ShopOwnershipStatus): boolean {
  return status === "available" || status === "expired_temporary" || status === "active_temporary";
}

export function formatExpirationDate(expiresAt: Date | string): string {
  const date = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function computeTemporaryExpiry(
  durationHours?: number,
  durationDays?: number,
  baseDate = new Date(),
): Date {
  const expiry = new Date(baseDate);
  if (durationDays && durationDays > 0) {
    expiry.setDate(expiry.getDate() + durationDays);
    return expiry;
  }
  const hours = Math.max(1, durationHours ?? 24);
  expiry.setTime(expiry.getTime() + hours * 60 * 60 * 1000);
  return expiry;
}

export const SHOP_OWNERSHIP_LABELS: Record<ShopOwnershipStatus, string> = {
  available: "Disponível",
  owned_permanent: "Adquirido",
  active_temporary: "Ativo",
  expired_temporary: "Expirado",
};
