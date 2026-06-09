import { auth } from "@/auth";
import { isInstructor } from "@/lib/permissions";
import { LIVE_ROOM_STATUS_LABELS } from "@/lib/validations/live-room";
import { listInstructorLiveRooms } from "@/services/live-room.service";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppLink } from "@/components/ui/app-link";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { Radio } from "lucide-react";

export default async function InstructorLiveRoomsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/instructor/live-rooms");

  if (!isInstructor(session.user.roles)) {
    redirect("/instructor/courses");
  }

  const rooms = await listInstructorLiveRooms(session.user.id);

  return (
    <PageShell>
      <PageHeader
        badge="Instrutor"
        icon={Radio}
        title="Minhas salas ao vivo"
        description="Gerencie suas aulas ao vivo e interaja com seus alunos."
        action={
          <LinkButton href="/instructor/live-rooms/new" size="sm" aria-label="Criar nova sala ao vivo">
            Nova sala ao vivo
          </LinkButton>
        }
      />

      {rooms.length === 0 ? (
        <EmptyState icon={Radio} title="Você ainda não criou nenhuma sala ao vivo.">
          <AppLink href="/instructor/live-rooms/new" className="mt-4 inline-block">
            Criar primeira sala ao vivo
          </AppLink>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {rooms.map((room: any) => {
            const isLive = room.status === "LIVE";
            const scheduledDate = new Date(room.scheduledAt);

            return (
              <Link
                key={room.id}
                href={`/live-rooms/${room.id}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-sky-400/35 hover:bg-white/[0.06]"
                aria-label={`Gerenciar sala ${room.title}`}
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-white">{room.title}</h3>
                    {isLive && <Badge variant="red">Live</Badge>}
                    <Badge variant={isLive ? "red" : room.status === "SCHEDULED" ? "sky" : "default"}>
                      {LIVE_ROOM_STATUS_LABELS[room.status] || room.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    {scheduledDate.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                    {" às "}
                    {scheduledDate.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {room.course && ` · ${room.course.title}`}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {room._count.participants} participantes
                  </p>
                </div>
                <span className="text-sm text-sky-300">Gerenciar →</span>
              </Link>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
