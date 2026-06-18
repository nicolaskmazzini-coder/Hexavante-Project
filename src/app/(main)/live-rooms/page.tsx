import { redirect } from "next/navigation";
import { Plus, Radio } from "lucide-react";
import { auth } from "@/auth";
import { LiveRoomCard } from "@/components/live/live-room-card";
import { LiveRoomFilters } from "@/components/live/live-room-filters";
import { Alert } from "@/components/ui/alert";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { isInstructor } from "@/lib/permissions";
import { listAvailableLiveRooms, type LiveRoomListFilter } from "@/services/live-room.service";

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function LiveRoomsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/live-rooms");

  const params = await searchParams;
  const filter: LiveRoomListFilter =
    params.status === "scheduled" || params.status === "live" || params.status === "ended"
      ? params.status
      : "all";

  let rooms: Awaited<ReturnType<typeof listAvailableLiveRooms>> = [];
  let error: string | null = null;

  try {
    rooms = await listAvailableLiveRooms(filter);
  } catch (e) {
    error = e instanceof Error ? e.message : "Erro ao carregar salas ao vivo";
    console.error("Erro ao carregar salas ao vivo:", error);
  }

  const canCreate = isInstructor(session.user.roles);

  return (
    <PageShell>
      <PageHeader
        badge="Ao vivo"
        icon={Radio}
        title="Salas ao vivo"
        description="Participe de aulas ao vivo com instrutores da plataforma."
        action={
          canCreate ? (
            <LinkButton href="/instructor/live-rooms/new" aria-label="Criar nova sala ao vivo">
              <Plus className="h-4 w-4" />
              Criar sala
            </LinkButton>
          ) : undefined
        }
      />

      <LiveRoomFilters current={filter} />

      {error ? (
        <Alert variant="danger" className="p-10 text-center">
          <p className="font-semibold">Erro ao carregar salas ao vivo.</p>
          <p className="mt-2 opacity-80">{error}</p>
        </Alert>
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={Radio}
          title="Nenhuma sala encontrada com este filtro."
          description={
            canCreate
              ? "Crie uma nova sala ou tente outro filtro."
              : "Novas transmissões aparecerão aqui quando forem agendadas."
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <LiveRoomCard
              key={room.id}
              id={room.id}
              title={room.title}
              description={room.description}
              status={room.status}
              scheduledAt={room.scheduledAt}
              instructorName={room.instructor.fullName || room.instructor.username}
              courseTitle={room.course?.title}
              participantCount={room._count.participants}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
