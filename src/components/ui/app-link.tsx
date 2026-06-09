import Link from "next/link";
import { cn } from "@/lib/cn";

type AppLinkProps = React.ComponentProps<typeof Link> & {
  muted?: boolean;
};

export function AppLink({ className, muted, ...props }: AppLinkProps) {
  return <Link className={cn(muted ? "hx-link-muted" : "hx-link", className)} {...props} />;
}
