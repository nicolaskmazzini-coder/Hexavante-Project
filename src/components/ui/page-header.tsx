import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";

type PageHeaderProps = {
  badge?: string;
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  badge,
  icon: Icon,
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {(badge || Icon) && (
            <div className="mb-4 flex items-center gap-2">
              {badge && <Badge variant="sky">{badge}</Badge>}
              {Icon && (
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-sky-400/20 bg-sky-400/10 text-sky-300">
                  <Icon className="h-4 w-4" />
                </span>
              )}
            </div>
          )}
          <h1 className="hx-page-title">{title}</h1>
          {description && <p className="hx-page-description">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
