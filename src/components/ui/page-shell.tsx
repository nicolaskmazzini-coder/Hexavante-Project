import { cn } from "@/lib/cn";

type PageShellProps = {
  className?: string;
  children: React.ReactNode;
  size?: "md" | "lg";
};

export function PageShell({ className, children, size = "lg" }: PageShellProps) {
  return <div className={cn(size === "lg" ? "hx-page" : "hx-page-md", className)}>{children}</div>;
}
