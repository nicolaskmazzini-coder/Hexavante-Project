"use client";

import { useCountdown } from "@/hooks/use-countdown";
import { formatTimer, useElapsedTimer } from "@/hooks/use-elapsed-timer";
import { Alert } from "@/components/ui/alert";
import { Clock3 } from "lucide-react";

type CountdownProps = {
  mode: "countdown";
  startedAt: string;
  timeLimitMinutes: number;
  attemptId: string;
  onExpire: () => void;
};

type ElapsedProps = {
  mode: "elapsed";
  startedAt: string;
  attemptId: string;
};

type Props = CountdownProps | ElapsedProps;

export function ExamTimer(props: Props) {
  if (props.mode === "elapsed") {
    return <ElapsedDisplay startedAt={props.startedAt} attemptId={props.attemptId} />;
  }

  return (
    <CountdownDisplay
      startedAt={props.startedAt}
      timeLimitMinutes={props.timeLimitMinutes}
      attemptId={props.attemptId}
      onExpire={props.onExpire}
    />
  );
}

function CountdownDisplay({
  startedAt,
  timeLimitMinutes,
  attemptId,
  onExpire,
}: Omit<CountdownProps, "mode">) {
  const remainingMs = useCountdown(startedAt, timeLimitMinutes, {
    storageKey: `exam-countdown-${attemptId}`,
    onExpire,
  });

  const warning = remainingMs > 0 && remainingMs <= 5 * 60 * 1000;
  const critical = remainingMs > 0 && remainingMs <= 60 * 1000;

  return (
    <div className="sticky top-[calc(var(--hx-header-height)+0.5rem)] z-20 space-y-3">
      <div
        className={`flex items-center justify-between rounded-xl border px-3 py-3 backdrop-blur sm:px-4 [-webkit-backdrop-filter:blur(12px)] ${
          critical
            ? "border-red-400/40 bg-red-500/10"
            : warning
              ? "border-amber-400/40 bg-amber-500/10"
              : "border-white/10 bg-slate-950/80"
        }`}
      >
        <span className="flex items-center gap-2 text-sm text-slate-300">
          <Clock3 className="h-4 w-4" />
          Tempo restante
        </span>
        <span
          className={`font-mono text-lg font-bold ${
            critical ? "text-red-300" : warning ? "text-amber-300" : "text-white"
          }`}
        >
          {formatTimer(remainingMs)}
        </span>
      </div>

      {warning && remainingMs > 0 && (
        <Alert variant={critical ? "danger" : "warning"}>
          {critical
            ? "Menos de 1 minuto! Finalize suas respostas."
            : "Restam menos de 5 minutos para concluir o simulado."}
        </Alert>
      )}
    </div>
  );
}

function ElapsedDisplay({ startedAt, attemptId }: { startedAt: string; attemptId: string }) {
  const elapsedMs = useElapsedTimer(startedAt, `exam-elapsed-${attemptId}`);

  return (
    <div className="sticky top-[calc(var(--hx-header-height)+0.5rem)] z-20">
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/80 px-3 py-3 backdrop-blur sm:px-4 [-webkit-backdrop-filter:blur(12px)]">
        <span className="flex items-center gap-2 text-sm text-slate-300">
          <Clock3 className="h-4 w-4" />
          Tempo decorrido
        </span>
        <span className="font-mono text-lg font-bold text-white">{formatTimer(elapsedMs)}</span>
      </div>
    </div>
  );
}
