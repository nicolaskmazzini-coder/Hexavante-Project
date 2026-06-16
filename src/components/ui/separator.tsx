"use client";

import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/cn";

const Separator = ({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) => (
  <SeparatorPrimitive.Root
    decorative={decorative}
    orientation={orientation}
    className={cn(
      "shrink-0 bg-sidebar-border",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className,
    )}
    {...props}
  />
);

export { Separator };
