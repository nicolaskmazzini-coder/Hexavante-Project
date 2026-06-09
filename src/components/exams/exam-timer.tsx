"use client";

import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Clock3 } from "lucide-react";

type Props = {
  startedAt: string;
  timeLimitMinutes: number;
  onExpire: () => void;
};

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function ExamTimer({ startedAt, timeLimitMinutes, onExpire }: Props) {
  const [remainingMs, setRemainingMs] = useState(() => {
    const limitMs = timeLimitMinutes * 60 * 1000;
    return limitMs - (Date.now() - new Date(startedAt).getTime());
  });
  const expiredRef = useRef(false);

  useEffect(() => {
    const limitMs = timeLimitMinutes * 60 * 1000;
    const started = new Date(startedAt).getTime();

    const tick = () => {
      const left = limitMs - (Date.now() - started);
      setRemainingMs(left);

      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt, timeLimitMinutes, onExpire]);

  const warning = remainingMs > 0 && remainingMs <= 5 * 60 * 1000;
  const critical = remainingMs > 0 && remainingMs <= 60 * 1000;

  return (
    <div className="space-y-3">
      <div
        className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
          critical
            ? "border-red-400/40 bg-red-500/10"
            : warning
              ? "border-amber-400/40 bg-amber-500/10"
              : "border-white/10 bg-white/[0.04]"
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
          {formatTime(remainingMs)}
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
