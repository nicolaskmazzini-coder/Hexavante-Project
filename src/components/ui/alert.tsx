import { cn } from "@/lib/cn";

const variants = {
  info: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  warning: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  danger: "border-red-400/20 bg-red-400/10 text-red-200",
};

type AlertProps = {
  variant?: keyof typeof variants;
  className?: string;
  children: React.ReactNode;
};

export function Alert({ variant = "info", className, children }: AlertProps) {
  return <div className={cn("hx-alert", variants[variant], className)}>{children}</div>;
}
