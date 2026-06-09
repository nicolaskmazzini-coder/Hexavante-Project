import { BookOpen } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  url?: string | null;
  title: string;
  className?: string;
};

export function CourseThumbnail({ url, title, className }: Props) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={title} className={cn("object-cover", className)} />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gradient-to-br from-sky-900/50 to-slate-900",
        className,
      )}
      aria-hidden
    >
      <BookOpen className="h-10 w-10 text-sky-400/50" />
    </div>
  );
}
