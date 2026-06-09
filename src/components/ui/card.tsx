import Link from "next/link";
import { cn } from "@/lib/cn";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  padding?: "none" | "sm" | "md" | "lg";
};

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({ className, padding = "md", children, ...props }: CardProps) {
  return (
    <div className={cn("hx-card", paddingMap[padding], className)} {...props}>
      {children}
    </div>
  );
}

type InteractiveCardProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
};

export function InteractiveCard({ href, className, children, ariaLabel }: InteractiveCardProps) {
  return (
    <Link href={href} className={cn("group hx-card-interactive block", className)} aria-label={ariaLabel}>
      <div className="hx-card-accent" />
      {children}
    </Link>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("mb-4 flex items-start justify-between gap-3", className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={cn("text-lg font-bold leading-snug text-white", className)}>{children}</h3>;
}

export function CardDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <p className={cn("mt-2 text-sm leading-6 text-slate-400", className)}>{children}</p>;
}

export function CardFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mt-5 flex flex-wrap items-center gap-4 border-t border-white/10 pt-4", className)}>
      {children}
    </div>
  );
}
