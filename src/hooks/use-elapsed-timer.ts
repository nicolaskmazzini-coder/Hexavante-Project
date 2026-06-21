"use client";

import { useEffect, useState } from "react";

export function useElapsedTimer(startedAt: string, storageKey?: string) {
  const startedMs = new Date(startedAt).getTime();

  // Valor inicial sem sessionStorage — evita hydration mismatch com RSC.
  const [elapsedMs, setElapsedMs] = useState(() => Date.now() - startedMs);

  useEffect(() => {
    const tick = (restoreFromStorage = false) => {
      let value = Date.now() - startedMs;
      if (restoreFromStorage && storageKey) {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) {
          const parsed = Number(saved);
          if (!Number.isNaN(parsed)) value = parsed;
        }
      }

      setElapsedMs(value);
      if (storageKey) {
        sessionStorage.setItem(storageKey, String(value));
      }
    };

    const initialId = window.setTimeout(() => tick(true), 0);
    const interval = setInterval(() => tick(false), 1000);
    return () => {
      window.clearTimeout(initialId);
      clearInterval(interval);
    };
  }, [startedAt, storageKey, startedMs]);

  return elapsedMs;
}

export function formatTimer(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
