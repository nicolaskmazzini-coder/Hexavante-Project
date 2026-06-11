"use client";

import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { getStartsInLabel } from "@/lib/live-room-utils";

type Props = {
  scheduledAt: string;
  status: string;
};

export function LiveRoomCountdown({ scheduledAt, status }: Props) {
  const isScheduled = status === "SCHEDULED";
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isScheduled) return;
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, [isScheduled]);

  if (!isScheduled) return null;

  const label = getStartsInLabel(new Date(scheduledAt), now);
  if (!label) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1.5 text-sm font-semibold text-sky-200">
      <CalendarClock className="h-4 w-4" />
      {label}
    </div>
  );
}
