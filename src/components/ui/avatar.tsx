import { UserRound } from "lucide-react";
import { cn } from "@/lib/cn";

const SIZE_MAP = {
  sm: { outer: "h-9 w-9", inner: "h-8 w-8", icon: "h-4 w-4" },
  md: { outer: "h-11 w-11", inner: "h-10 w-10", icon: "h-5 w-5" },
  lg: { outer: "h-20 w-20", inner: "h-[4.5rem] w-[4.5rem]", icon: "h-10 w-10" },
  xl: { outer: "h-36 w-36", inner: "h-32 w-32", icon: "h-14 w-14" },
} as const;

type AvatarSize = keyof typeof SIZE_MAP;

type Props = {
  src?: string | null;
  alt: string;
  size?: AvatarSize;
  borderClassName?: string | null;
  className?: string;
  overlay?: React.ReactNode;
};

export function Avatar({ src, alt, size = "md", borderClassName, className, overlay }: Props) {
  const dims = SIZE_MAP[size];
  const hasBorder = Boolean(borderClassName);

  const image = (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-slate-950/80",
        hasBorder ? dims.inner : dims.outer,
        !hasBorder && "border border-white/10 shadow-lg shadow-black/20",
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-slate-500">
          <UserRound className={dims.icon} />
        </div>
      )}
      {overlay}
    </div>
  );

  if (!hasBorder) {
    return <div className={cn("relative inline-flex", className)}>{image}</div>;
  }

  return (
    <div className={cn("relative inline-flex shrink-0", dims.outer, borderClassName, className)}>
      <div className="absolute inset-0 rounded-full" aria-hidden />
      <div className="relative z-10 flex h-full w-full items-center justify-center rounded-full">
        {image}
      </div>
    </div>
  );
}
