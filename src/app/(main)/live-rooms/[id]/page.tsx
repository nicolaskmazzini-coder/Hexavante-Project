import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  CircleAlert,
  PlayCircle,
  Radio,
  Square,
  Users,
  Video,
} from "lucide-react";
import { auth } from "@/auth";
import { endLiveRoomAction, startLiveRoomAction } from "@/app/actions/live-room";
import { LiveChatWrapper } from "@/components/live/live-chat-wrapper";
import { Button } from "@/components/ui/button";
import { getVideoEmbedUrl } from "@/lib/video";
import { LIVE_ROOM_STATUS_LABELS } from "@/lib/validations/live-room";
import { getLiveChatMessages, getLiveRoom, joinLiveRoom } from "@/services/live-room.service";

export default async function LiveRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  if (!session?.user?.id) redirect("/login?callbackUrl=/live-rooms/" + id);

  const room = await getLiveRoom(id);
  if (!room) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-8">
          <CircleAlert className="h-8 w-8 text-amber-200" />
          <h1 className="mt-4 text-3xl font-black text-white">Sala não encontrada</h1>
          <p className="mt-3 text-slate-300">Esta sala ao vivo não existe ou foi removida.</p>
          <Link
            href="/live-rooms"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-5 py-2.5 font-semibold text-white transition hover:bg-[#1d4ed8]"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para salas ao vivo
          </Link>
        </div>
      </div>
    );
  }

  const isParticipant = room.participants.some(
    (p: any) => p.userId === session.user.id && !p.leftAt,
  );

  if (!isParticipant && room.status === "LIVE") {
    try {
      await joinLiveRoom(id, session.user.id);
    } catch (error) {
      return (
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-8">
            <CircleAlert className="h-8 w-8 text-red-200" />
            <h1 className="mt-4 text-3xl font-black text-white">Não foi possível entrar</h1>
            <p className="mt-3 text-red-100">
              {error instanceof Error ? error.message : "Erro desconhecido"}
            </p>
            <Link
              href="/live-rooms"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-5 py-2.5 font-semibold text-white transition hover:bg-[#1d4ed8]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para salas ao vivo
            </Link>
          </div>
        </div>
      );
    }
  }

  const messages = await getLiveChatMessages(id);
  const embedUrl = room.videoUrl
    ? getVideoEmbedUrl(room.videoUrl, room.videoProvider)
    : null;

  const isLive = room.status === "LIVE";
  const isInstructor = room.instructorId === session.user.id;
  const activeParticipants = room.participants.filter((p: any) => !p.leftAt);
  const scheduledAt = new Date(room.scheduledAt);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            href="/live-rooms"
            className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300 hover:text-sky-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Salas ao vivo
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-white">{room.title}</h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                isLive
                  ? "border-red-400/20 bg-red-500/10 text-red-200"
                  : room.status === "SCHEDULED"
                    ? "border-sky-400/20 bg-sky-400/10 text-sky-200"
                    : "border-white/10 bg-white/[0.05] text-slate-300"
              }`}
            >
              {isLive ? <Radio className="h-3.5 w-3.5" /> : <CalendarClock className="h-3.5 w-3.5" />}
              {LIVE_ROOM_STATUS_LABELS[room.status] || room.status}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            {room.instructor.fullName || room.instructor.username}
            {room.course ? ` · ${room.course.title}` : ""}
          </p>
        </div>

        {isInstructor && (
          <div className="flex flex-wrap gap-3">
            {room.status === "SCHEDULED" && (
              <form
                action={async () => {
                  "use server";
                  await startLiveRoomAction(id);
                }}
              >
                <Button type="submit">
                  <PlayCircle className="h-4 w-4" />
                  Iniciar transmissão
                </Button>
              </form>
            )}
            {room.status === "LIVE" && (
              <form
                action={async () => {
                  "use server";
                  await endLiveRoomAction(id);
                }}
              >
                <Button type="submit" variant="danger">
                  <Square className="h-4 w-4" />
                  Encerrar transmissão
                </Button>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl shadow-black/30">
            <div className="aspect-video">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="h-full w-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title={room.title}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center bg-slate-950 px-6 text-center">
                  <Video className="h-12 w-12 text-slate-600" />
                  <p className="mt-4 text-lg font-bold text-white">
                    {isLive ? "Vídeo não configurado" : room.status === "SCHEDULED" ? "Aula agendada" : "Aula encerrada"}
                  </p>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                    {isLive
                      ? "Adicione uma URL do YouTube ou Vimeo para exibir a transmissão nesta área."
                      : scheduledAt.toLocaleString("pt-BR", { dateStyle: "full", timeStyle: "short" })}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <CalendarClock className="h-4 w-4 text-sky-300" />
                <span className="text-xs font-semibold uppercase">Horário</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-white">
                {scheduledAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} às{" "}
                {scheduledAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Users className="h-4 w-4 text-teal-300" />
                <span className="text-xs font-semibold uppercase">Participantes</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-white">
                {activeParticipants.length}
                {room.maxParticipants ? ` / ${room.maxParticipants}` : ""} online
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <BookOpen className="h-4 w-4 text-amber-300" />
                <span className="text-xs font-semibold uppercase">Curso</span>
              </div>
              <p className="mt-2 truncate text-sm font-semibold text-white">
                {room.course?.title ?? "Sala independente"}
              </p>
            </div>
          </div>

          {(room.description || isInstructor) && (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="font-bold text-white">Sobre esta aula</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {room.description ?? "Sem descrição adicionada."}
              </p>
            </div>
          )}
        </div>

        <div className="h-[calc(100vh-8rem)] min-h-[520px] lg:sticky lg:top-24">
          <LiveChatWrapper
            roomId={id}
            currentUserId={session.user.id}
            initialMessages={messages.map((msg: any) => ({
              id: msg.id,
              userId: msg.userId,
              username: msg.user.username,
              fullName: msg.user.fullName,
              message: msg.message,
              createdAt: msg.createdAt,
            }))}
            disabled={!isLive}
          />
        </div>
      </div>
    </div>
  );
}
