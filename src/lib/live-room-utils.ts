export function getStartsInLabel(scheduledAt: Date): string | null {
  const diff = scheduledAt.getTime() - Date.now();
  if (diff <= 0) return null;

  const minutes = Math.ceil(diff / (60 * 1000));
  if (minutes < 60) {
    return `Começa em ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Começa em ${hours}h`;
  }

  const days = Math.floor(hours / 24);
  return `Começa em ${days} dia${days > 1 ? "s" : ""}`;
}
