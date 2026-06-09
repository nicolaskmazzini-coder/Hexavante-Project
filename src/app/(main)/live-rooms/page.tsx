import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarClock, Plus, Radio, Users, BookOpen, ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { LIVE_ROOM_STATUS_LABELS } from "@/lib/validations/live-room";
import { listAvailableLiveRooms } from "@/services/live-room.service";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { InteractiveCard } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";

export default async function LiveRoomsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/live-rooms");

  let rooms: any[] = [];
  let error: string | null = null;

  try {
    rooms = await listAvailableLiveRooms();
  } catch (e) {
    error = e instanceof Error ? e.message : "Erro ao carregar salas ao vivo";
    console.error("Erro ao carregar salas ao vivo:", error);
  }

  return (
    <PageShell>
      <PageHeader
        badge="Ao vivo"
        icon={Radio}
        title="Salas ao vivo"
        description="Participe de aulas ao vivo com instrutores da plataforma."
        action={
          <LinkButton href="/instructor/live-rooms/new" aria-label="Criar nova sala ao vivo">
            <Plus className="h-4 w-4" />
            Criar sala
          </LinkButton>
        }
      />

      {error ? (
        <Alert variant="danger" className="p-10 text-center">
          <p className="font-semibold">Erro ao carregar salas ao vivo.</p>
          <p className="mt-2 opacity-80">A funcionalidade ainda está sendo configurada.</p>
        </Alert>
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={Radio}
          title="Nenhuma sala ao vivo disponível no momento."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room: any) => {
            const isLive = room.status === "LIVE";
            const scheduledDate = new Date(room.scheduledAt);

            return (
              <InteractiveCard
                key={room.id}
                href={`/live-rooms/${room.id}`}
                ariaLabel={`Entrar na sala ${room.title}`}
                className="p-6 hover:border-teal-400/35"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white transition-colors group-hover:text-teal-200">
                      {room.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {room.instructor.fullName || room.instructor.username}
                    </p>
                  </div>
                  {isLive && <Badge variant="red">Live</Badge>}
                </div>

                {room.description && (
                  <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-300">
                    {room.description}
                  </p>
                )}

                <div className="space-y-3 text-sm text-slate-400">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{LIVE_ROOM_STATUS_LABELS[room.status] || room.status}</Badge>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarClock className="h-4 w-4 text-teal-300" />
                      {scheduledDate.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}{" "}
                      {scheduledDate.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-sky-300" />
                    <span>{room._count.participants} participantes</span>
                  </div>

                  {room.course && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-teal-300" />
                      <span>{room.course.title}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-sm font-semibold text-teal-200">
                    {isLive ? "Entrar agora" : "Ver detalhes"}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-teal-200" />
                </div>
              </InteractiveCard>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
