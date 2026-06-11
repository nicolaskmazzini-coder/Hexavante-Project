"use client";

import { useEffect, useState } from "react";

export function useElapsedTimer(startedAt: string, storageKey?: string) {
  const startedMs = new Date(startedAt).getTime();

  const computeElapsed = () => {
    if (storageKey && typeof window !== "undefined") {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = Number(saved);
        if (!Number.isNaN(parsed)) return parsed;
      }
    }
    return Date.now() - startedMs;
  };

  const [elapsedMs, setElapsedMs] = useState(computeElapsed);

  useEffect(() => {
    const tick = () => {
      const value = Date.now() - startedMs;
      setElapsedMs(value);
      if (storageKey) {
        sessionStorage.setItem(storageKey, String(value));
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt, storageKey, startedMs]);

  return elapsedMs;
}

export function formatTimer(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
