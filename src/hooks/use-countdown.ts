"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  storageKey?: string;
  onExpire?: () => void;
};

export function useCountdown(
  startedAt: string,
  timeLimitMinutes: number,
  { storageKey, onExpire }: Options = {},
) {
  const limitMs = timeLimitMinutes * 60 * 1000;
  const startedMs = new Date(startedAt).getTime();
  const expiredRef = useRef(false);

  // Valor inicial sem sessionStorage — evita hydration mismatch com RSC.
  const [remainingMs, setRemainingMs] = useState(() => limitMs - (Date.now() - startedMs));

  useEffect(() => {
    expiredRef.current = false;

    const tick = (restoreFromStorage = false) => {
      let left = limitMs - (Date.now() - startedMs);
      if (restoreFromStorage && storageKey) {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) {
          const parsed = Number(saved);
          if (!Number.isNaN(parsed)) left = parsed;
        }
      }

      setRemainingMs(left);
      if (storageKey) {
        sessionStorage.setItem(storageKey, String(left));
      }

      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    };

    const initialId = window.setTimeout(() => tick(true), 0);
    const interval = setInterval(() => tick(false), 1000);
    return () => {
      window.clearTimeout(initialId);
      clearInterval(interval);
    };
  }, [startedAt, timeLimitMinutes, storageKey, limitMs, startedMs, onExpire]);

  return remainingMs;
}
