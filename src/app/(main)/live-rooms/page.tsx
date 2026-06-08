import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarClock, Plus, Radio, Users, BookOpen, ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { LIVE_ROOM_STATUS_LABELS } from "@/lib/validations/live-room";
import { listAvailableLiveRooms } from "@/services/live-room.service";

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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 rounded-xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-400/10 px-3 py-1 text-xs font-semibold text-teal-200">
              <Radio className="h-3.5 w-3.5" />
              Ao vivo
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white">Salas ao vivo</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Participe de aulas ao vivo com instrutores da plataforma.
            </p>
          </div>
          <Link
            href="/instructor/live-rooms/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-[#1d4ed8]"
            aria-label="Criar nova sala ao vivo"
          >
            <Plus className="h-4 w-4" />
            Criar sala
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-10 text-center">
          <p className="font-semibold text-red-200">Erro ao carregar salas ao vivo.</p>
          <p className="mt-2 text-sm text-slate-400">A funcionalidade ainda está sendo configurada.</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
          <Radio className="mx-auto h-8 w-8 text-slate-500" />
          <p className="mt-3 font-semibold text-slate-200">Nenhuma sala ao vivo disponível no momento.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room: any) => {
            const isLive = room.status === "LIVE";
            const scheduledDate = new Date(room.scheduledAt);

            return (
              <Link
                key={room.id}
                href={`/live-rooms/${room.id}`}
                className="group block overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-teal-400/35 hover:bg-white/[0.06]"
                aria-label={`Entrar na sala ${room.title}`}
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
                  {isLive && (
                    <span className="rounded-full border border-red-400/20 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-200">
                      Live
                    </span>
                  )}
                </div>

                {room.description && (
                  <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-300">
                    {room.description}
                  </p>
                )}

                <div className="space-y-3 text-sm text-slate-400">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-slate-200">
                      {LIVE_ROOM_STATUS_LABELS[room.status] || room.status}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarClock className="h-4 w-4 text-teal-300" />
                      {scheduledDate.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                      {" "}
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
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
