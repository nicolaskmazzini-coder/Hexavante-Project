import { cn } from "@/lib/cn";

const variants = {
  default: "border-white/10 bg-white/5 text-slate-300",
  sky: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  teal: "border-teal-400/20 bg-teal-400/10 text-teal-200",
  amber: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  violet: "border-violet-400/20 bg-violet-400/10 text-violet-200",
  blue: "border-blue-400/20 bg-blue-400/10 text-blue-200",
  red: "border-red-400/20 bg-red-400/10 text-red-200",
};

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
};

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span className={cn("hx-badge", variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
