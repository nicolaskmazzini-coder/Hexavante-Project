import { Card } from "@/components/ui/card";

type Point = {
  score: number;
  finishedAt: Date | null;
  exam: { title: string };
};

type Props = {
  data: Point[];
};

export function ExamEvolutionChart({ data }: Props) {
  if (data.length === 0) return null;

  return (
    <Card padding="md" className="mt-6">
      <h2 className="font-semibold text-white">Evolução recente</h2>
      <p className="mt-1 text-sm text-slate-400">Últimas {data.length} tentativas finalizadas</p>

      <div className="mt-6 flex h-40 items-end gap-2">
        {data.map((point, index) => (
          <div
            key={`${point.finishedAt?.toISOString() ?? index}-${index}`}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <span className="text-xs font-semibold text-slate-300">{Math.round(point.score)}%</span>
            <div className="flex w-full items-end justify-center" style={{ height: "120px" }}>
              <div
                className="w-full max-w-10 rounded-t-md bg-gradient-to-t from-teal-500 to-sky-400"
                style={{ height: `${Math.max(8, point.score)}%` }}
                title={`${point.exam.title} — ${point.finishedAt?.toLocaleDateString("pt-BR") ?? ""}`}
              />
            </div>
            <span className="text-[10px] text-slate-500">
              {point.finishedAt?.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
