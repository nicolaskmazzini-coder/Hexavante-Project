import { ArrowRight, BookOpen, CalendarClock, Radio, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InteractiveCard } from "@/components/ui/card";
import { getStartsInLabel } from "@/lib/live-room-utils";
import { LIVE_ROOM_STATUS_LABELS } from "@/lib/validations/live-room";

type Props = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  scheduledAt: Date;
  instructorName: string;
  courseTitle?: string | null;
  participantCount: number;
};

export function LiveRoomCard({
  id,
  title,
  description,
  status,
  scheduledAt,
  instructorName,
  courseTitle,
  participantCount,
}: Props) {
  const isLive = status === "LIVE";
  const startsIn = status === "SCHEDULED" ? getStartsInLabel(scheduledAt) : null;

  return (
    <InteractiveCard
      href={`/live-rooms/${id}`}
      ariaLabel={`Entrar na sala ${title}`}
      className="p-6 hover:border-teal-400/35"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-white transition-colors group-hover:text-teal-200">
            {title}
          </h3>
          <p className="mt-1 text-sm text-slate-400">{instructorName}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {isLive && <Badge variant="red">Live</Badge>}
          {startsIn && <Badge variant="sky">{startsIn}</Badge>}
        </div>
      </div>

      {description && (
        <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-300">{description}</p>
      )}

      <div className="space-y-3 text-sm text-slate-400">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{LIVE_ROOM_STATUS_LABELS[status] || status}</Badge>
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="h-4 w-4 text-teal-300" />
            {scheduledAt.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}{" "}
            {scheduledAt.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-sky-300" />
          <span>{participantCount} participantes</span>
        </div>

        {courseTitle && (
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-teal-300" />
            <span>{courseTitle}</span>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
        <span className="flex items-center gap-2 text-sm font-semibold text-teal-200">
          {isLive && <Radio className="h-4 w-4" />}
          {isLive ? "Entrar agora" : "Ver detalhes"}
        </span>
        <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-teal-200" />
      </div>
    </InteractiveCard>
  );
}
