import * as React from "react";
import { cn } from "@/lib/cn";

export type NativeSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <select ref={ref} className={cn("hx-select", className)} {...props}>
        {children}
      </select>
    );
  },
);
NativeSelect.displayName = "NativeSelect";

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

const Select = ({ value, onValueChange, children, className = "" }: SelectProps) => {
  return (
    <div className={cn("relative", className)}>
      <select value={value} onChange={(e) => onValueChange?.(e.target.value)} className="hx-select">
        {children}
      </select>
    </div>
  );
};

Select.displayName = "Select";

export { Select };

export const SelectTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("hx-input flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  ),
);
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(({ className = "", placeholder, ...props }, ref) => (
  <span ref={ref} className={className} {...props}>
    {placeholder}
  </span>
));
SelectValue.displayName = "SelectValue";

export const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-lg border border-white/10 bg-slate-950 p-1 text-white shadow-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
SelectContent.displayName = "SelectContent";

export const SelectItem = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement> & { value: string }
>(({ className = "", children, value, ...props }, ref) => (
  <option
    ref={ref}
    value={value}
    className={cn("rounded-sm px-2 py-1.5 text-sm", className)}
    {...props}
  >
    {children}
  </option>
));
SelectItem.displayName = "SelectItem";
