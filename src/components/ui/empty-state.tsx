import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div className={cn("hx-empty", className)}>
      <Icon className="mx-auto h-8 w-8 text-slate-500" />
      <p className="mt-3 font-semibold text-slate-200">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      {children}
    </div>
  );
}
