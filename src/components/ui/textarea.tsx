import * as React from "react";
import { cn } from "@/lib/cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", ...props }, ref) => {
    return <textarea className={cn("hx-textarea min-h-[80px]", className)} ref={ref} {...props} />;
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
