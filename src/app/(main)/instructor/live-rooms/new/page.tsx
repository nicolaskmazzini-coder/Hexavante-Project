import { auth } from "@/auth";
import { isInstructor } from "@/lib/permissions";
import { createLiveRoomSchema } from "@/lib/validations/live-room";
import { createLiveRoom } from "@/services/live-room.service";
import { CreateLiveRoomForm } from "@/components/live/create-live-room-form";
import { redirect } from "next/navigation";

export default async function CreateLiveRoomPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/instructor/live-rooms/new");

  if (!isInstructor(session.user.roles)) {
    redirect("/instructor/courses");
  }

  async function createRoomAction(formData: unknown) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Não autenticado");
    }
    if (!isInstructor(session.user.roles)) {
      throw new Error("Sem permissão.");
    }

    const input = formData as Record<string, unknown>;
    const parsed = createLiveRoomSchema.safeParse({
      ...input,
      courseId: input.courseId || undefined,
      videoUrl: input.videoUrl || undefined,
      description: input.description || undefined,
    });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const room = await createLiveRoom(session.user.id, parsed.data);
    redirect(`/live-rooms/${room.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Nova sala ao vivo</h1>
        <p className="mt-2 text-slate-300">
          Crie uma sala ao vivo para ensinar seus alunos em tempo real.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
        <CreateLiveRoomForm onSubmit={createRoomAction} />
      </div>
    </div>
  );
}
