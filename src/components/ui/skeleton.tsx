// Componente de skeleton loading
// Exibe estados de carregamento com animação
import * as React from "react";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`animate-pulse rounded-md bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-[length:200%_100%] ${className}`}
        {...props}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";

export { Skeleton };
