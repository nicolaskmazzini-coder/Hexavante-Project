// Estilos de cores para cada status de curso/aplicação
const styles: Record<string, string> = {
  PENDING_REVIEW: "bg-amber-400/10 text-amber-200 border border-amber-400/20",
  APPROVED: "bg-emerald-400/10 text-emerald-200 border border-emerald-400/20",
  REJECTED: "bg-red-400/10 text-red-200 border border-red-400/20",
  REVISION_REQUIRED: "bg-orange-400/10 text-orange-200 border border-orange-400/20",
  PENDING: "bg-amber-400/10 text-amber-200 border border-amber-400/20",
};

// Props do componente StatusBadge
type Props = {
  status: string; // Status do curso/aplicação
  label: string; // Rótulo a ser exibido
};

// Componente de badge para exibir status
// Aplica cores baseadas no status, usa tema azul e preto
export function StatusBadge({ status, label }: Props) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? "border border-white/10 bg-white/[0.05] text-slate-400"}`}
    >
      {label}
    </span>
  );
}
