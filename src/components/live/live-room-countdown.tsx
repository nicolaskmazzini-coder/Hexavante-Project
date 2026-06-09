"use client";

import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { getStartsInLabel } from "@/lib/live-room-utils";

type Props = {
  scheduledAt: string;
  status: string;
};

export function LiveRoomCountdown({ scheduledAt, status }: Props) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "SCHEDULED") {
      setLabel(null);
      return;
    }

    const update = () => {
      setLabel(getStartsInLabel(new Date(scheduledAt)));
    };

    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, [scheduledAt, status]);

  if (!label) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1.5 text-sm font-semibold text-sky-200">
      <CalendarClock className="h-4 w-4" />
      {label}
    </div>
  );
}
