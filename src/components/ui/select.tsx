// Componente de select reutilizável
// Aplica tema azul e preto
import * as React from "react";

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

const Select = ({ value, onValueChange, children, className = "" }: SelectProps) => {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        className="flex h-10 w-full appearance-none rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white focus-visible:border-sky-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/15 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {children}
      </select>
    </div>
  );
};

Select.displayName = "Select";

export { Select };

// Componentes auxiliares para compatibilidade
export const SelectTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", children, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex h-10 w-full items-center justify-between rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white ${className}`}
    {...props}
  >
    {children}
  </div>
));
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

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", children, ...props }, ref) => (
  <div
    ref={ref}
    className={`relative z-50 min-w-[8rem] overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] p-1 text-white shadow-md ${className}`}
    {...props}
  >
    {children}
  </div>
));
SelectContent.displayName = "SelectContent";

export const SelectItem = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement> & { value: string }
>(({ className = "", children, value, ...props }, ref) => (
  <option
    ref={ref}
    value={value}
    className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-sky-400/10 focus:bg-sky-400/10 ${className}`}
    {...props}
  >
    {children}
  </option>
));
SelectItem.displayName = "SelectItem";
