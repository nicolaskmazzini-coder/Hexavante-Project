import { Skeleton } from "@/components/ui/skeleton";

export function HeaderXpSkeleton() {
  return (
    <div className="hidden min-w-[140px] flex-col gap-1.5 md:flex">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}
