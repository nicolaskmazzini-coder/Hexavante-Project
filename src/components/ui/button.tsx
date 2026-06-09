import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

const variantClasses = {
  default: "hx-btn-primary",
  outline: "hx-btn-secondary",
  ghost: "hx-btn-ghost",
  danger: "hx-btn-danger",
      accent:
        "hx-btn-primary bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-teal-600",
};

const sizeClasses = {
  default: "min-h-10",
  sm: "min-h-9 px-3 py-1.5 text-xs",
  lg: "min-h-11 px-5 py-2.5",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(variantClasses[variant], sizeClasses[size], className)}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

type LinkButtonProps = React.ComponentProps<typeof Link> & {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
};

export function LinkButton({
  className,
  variant = "default",
  size = "default",
  ...props
}: LinkButtonProps) {
  return (
    <Link className={cn(variantClasses[variant], sizeClasses[size], className)} {...props} />
  );
}

export { Button };
