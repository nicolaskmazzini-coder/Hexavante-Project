// Componente de botão reutilizável
// Aplica tema azul e preto com gradientes, sombras e efeitos cyberpunk
import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "danger" | "cyberpunk";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const baseStyles = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]/70 disabled:pointer-events-none disabled:opacity-50";
    
    const variantStyles = {
      default: "bg-[#2563eb] text-white shadow-lg shadow-blue-950/30 hover:bg-[#1d4ed8] hover:-translate-y-0.5",
      outline: "border border-white/12 bg-white/[0.03] text-slate-100 hover:border-sky-400/40 hover:bg-sky-400/10",
      ghost: "text-slate-300 hover:bg-white/[0.06] hover:text-white",
      danger: "bg-red-600 text-white shadow-lg shadow-red-950/25 hover:bg-red-700 hover:-translate-y-0.5",
      cyberpunk: "bg-gradient-to-r from-[#2563eb] to-[#14b8a6] text-white shadow-lg shadow-blue-950/30 hover:from-[#1d4ed8] hover:to-[#0f766e] hover:-translate-y-0.5",
    };

    return (
      <button
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button };
