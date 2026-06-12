import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: "default" | "yellow" | "red" | "teal";
};

const colors = {
  default: "text-sky-300",
  yellow: "text-amber-300",
  red: "text-red-300",
  teal: "text-teal-300",
};

export function StatCard({ icon: Icon, label, value, color = "default" }: Props) {
  return (
    <div className="hx-stat">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <p className={cn("mt-2 text-3xl font-bold", colors[color])}>{value}</p>
    </div>
  );
}
