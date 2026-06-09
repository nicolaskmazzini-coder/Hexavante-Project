import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";
import { EXAM_TYPE_LABELS } from "@/lib/validations/exam";
import { cn } from "@/lib/cn";

type Props = {
  current: {
    tipo?: string;
    q?: string;
    sort?: string;
  };
};

function buildHref(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const qs = search.toString();
  return qs ? `/simulados?${qs}` : "/simulados";
}

export function ExamFilters({ current }: Props) {
  return (
    <Card padding="md" className="mb-6 space-y-4">
      <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="q" className="mb-1.5 block text-sm font-semibold text-slate-200">
            Buscar
          </label>
          <Input
            id="q"
            name="q"
            defaultValue={current.q ?? ""}
            placeholder="Nome ou descrição do simulado..."
          />
        </div>
        <div className="w-full sm:w-40">
          <label htmlFor="sort" className="mb-1.5 block text-sm font-semibold text-slate-200">
            Ordenar
          </label>
          <NativeSelect id="sort" name="sort" defaultValue={current.sort ?? "recent"}>
            <option value="recent">Mais recentes</option>
            <option value="popular">Mais populares</option>
          </NativeSelect>
        </div>
        {current.tipo && <input type="hidden" name="tipo" value={current.tipo} />}
        <Button type="submit" className="sm:mb-0">
          <Search className="h-4 w-4" />
          Filtrar
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Link
          href={buildHref({ q: current.q, sort: current.sort })}
          className={cn(
            "hx-filter-pill",
            !current.tipo ? "hx-filter-pill-active" : "hx-filter-pill-inactive",
          )}
        >
          Todos
        </Link>
        {Object.entries(EXAM_TYPE_LABELS).map(([value, label]) => (
          <Link
            key={value}
            href={buildHref({ tipo: value, q: current.q, sort: current.sort })}
            className={cn(
              "hx-filter-pill",
              current.tipo === value ? "hx-filter-pill-active" : "hx-filter-pill-inactive",
            )}
          >
            {label}
          </Link>
        ))}
      </div>
    </Card>
  );
}
