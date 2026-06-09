import { auth } from "@/auth";
import { cancelLiveRoomAction } from "@/app/actions/live-room";
import { DeleteContentButton } from "@/components/courses/delete-content-button";
import { EditLiveRoomForm } from "@/components/live/edit-live-room-form";
import { AppLink } from "@/components/ui/app-link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { isInstructor } from "@/lib/permissions";
import { LIVE_ROOM_STATUS_LABELS } from "@/lib/validations/live-room";
import {
  getLiveRoom,
  listInstructorApprovedCourses,
} from "@/services/live-room.service";
import { notFound, redirect } from "next/navigation";
import { Radio } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function EditLiveRoomPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/instructor/live-rooms/${id}/edit`);
  if (!isInstructor(session.user.roles)) redirect("/instructor/courses");

  const room = await getLiveRoom(id);
  if (!room || room.instructorId !== session.user.id) notFound();
  if (room.status !== "SCHEDULED") {
    redirect(`/live-rooms/${id}`);
  }

  const courses = await listInstructorApprovedCourses(session.user.id);

  return (
    <PageShell size="md">
      <AppLink href="/instructor/live-rooms" muted className="mb-4 inline-flex items-center gap-1">
        ← Minhas salas
      </AppLink>

      <PageHeader
        badge="Instrutor"
        icon={Radio}
        title={`Editar: ${room.title}`}
        description="Atualize os dados da sala antes de iniciar a transmissão."
        action={
          <LinkButton href={`/live-rooms/${id}`} variant="outline" size="sm">
            Abrir sala
          </LinkButton>
        }
      />

      <Badge variant="sky" className="mb-6">
        {LIVE_ROOM_STATUS_LABELS[room.status]}
      </Badge>

      <Card padding="lg">
        <EditLiveRoomForm room={room} courses={courses} />
      </Card>

      <div className="mt-8 border-t border-white/10 pt-6">
        <DeleteContentButton
          action={cancelLiveRoomAction.bind(null, id)}
          label="Cancelar sala"
          confirmMessage="Cancelar esta sala agendada?"
        />
      </div>
    </PageShell>
  );
}
