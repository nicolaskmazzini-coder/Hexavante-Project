import Link from "next/link";
import { cn } from "@/lib/cn";

type Filter = "all" | "scheduled" | "live" | "ended";

type Props = {
  current: Filter;
};

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "scheduled", label: "Agendadas" },
  { value: "live", label: "Ao vivo" },
  { value: "ended", label: "Encerradas" },
];

export function LiveRoomFilters({ current }: Props) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {FILTERS.map((filter) => (
        <Link
          key={filter.value}
          href={filter.value === "all" ? "/live-rooms" : `/live-rooms?status=${filter.value}`}
          className={cn(
            "hx-filter-pill",
            current === filter.value ? "hx-filter-pill-active" : "hx-filter-pill-inactive",
          )}
        >
          {filter.label}
        </Link>
      ))}
    </div>
  );
}
