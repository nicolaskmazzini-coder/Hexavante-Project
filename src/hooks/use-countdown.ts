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

  const computeRemaining = () => {
    if (storageKey && typeof window !== "undefined") {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = Number(saved);
        if (!Number.isNaN(parsed)) return parsed;
      }
    }
    return limitMs - (Date.now() - startedMs);
  };

  const [remainingMs, setRemainingMs] = useState(computeRemaining);

  useEffect(() => {
    expiredRef.current = false;

    const tick = () => {
      const left = limitMs - (Date.now() - startedMs);
      setRemainingMs(left);
      if (storageKey) {
        sessionStorage.setItem(storageKey, String(left));
      }

      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt, timeLimitMinutes, storageKey, limitMs, startedMs, onExpire]);

  return remainingMs;
}
