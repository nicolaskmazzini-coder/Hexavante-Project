import { auth } from "@/auth";
import { CreateLiveRoomForm } from "@/components/live/create-live-room-form";
import { AppLink } from "@/components/ui/app-link";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { isInstructor } from "@/lib/permissions";
import { listInstructorApprovedCourses } from "@/services/live-room.service";
import { redirect } from "next/navigation";
import { Radio } from "lucide-react";

export default async function CreateLiveRoomPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/instructor/live-rooms/new");

  if (!isInstructor(session.user.roles)) {
    redirect("/instructor/courses");
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
        title="Nova sala ao vivo"
        description="Crie uma sala ao vivo para ensinar seus alunos em tempo real."
      />

      <CreateLiveRoomForm courses={courses} />
    </PageShell>
  );
}
