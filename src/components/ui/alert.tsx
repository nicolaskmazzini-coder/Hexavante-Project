import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";

const variants = {
  info: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  warning: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  danger: "border-red-400/20 bg-red-500/10 text-red-200",
};

type AlertProps = {
  variant?: keyof typeof variants;
  className?: string;
  children: React.ReactNode;
};

export function Alert({ variant = "info", className, children }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn("flex gap-3 rounded-lg border px-4 py-3 text-sm", variants[variant], className)}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
