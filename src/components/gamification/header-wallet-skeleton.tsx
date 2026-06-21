import { Skeleton } from "@/components/ui/skeleton";

export function HeaderWalletSkeleton() {
  return (
    <div className="hidden items-center gap-2 sm:flex">
      <Skeleton className="h-8 w-16 rounded-lg" />
      <Skeleton className="h-9 w-20 rounded-lg" />
    </div>
  );
}
