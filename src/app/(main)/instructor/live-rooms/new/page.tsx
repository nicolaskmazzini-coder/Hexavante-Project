// Importações necessárias para a página de criação de sala ao vivo
import { auth } from "@/auth"; // Função para obter sessão do usuário
import { isInstructor } from "@/lib/permissions"; // Função de verificação de permissão
import { createLiveRoom } from "@/services/live-room.service"; // Serviço para criar sala ao vivo
import { redirect } from "next/navigation"; // Função para redirecionar
import { CreateLiveRoomForm } from "@/components/live/create-live-room-form"; // Componente de formulário
import type { CreateLiveRoomInput } from "@/lib/validations/live-room"; // Tipo de entrada para validação

// Página de criação de sala ao vivo
// Permite instrutores criarem novas salas ao vivo, aplica tema azul e preto
export default async function CreateLiveRoomPage() {
  const session = await auth(); // Obtém sessão do usuário
  if (!session?.user?.id) redirect("/login?callbackUrl=/instructor/live-rooms/new"); // Redireciona se não estiver logado

  if (!isInstructor(session.user.roles)) {
    redirect("/instructor/courses"); // Redireciona se não for instrutor
  }

  // Função server action para criar sala ao vivo
  async function createRoomAction(formData: CreateLiveRoomInput) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Não autenticado");
    }

    const room = await createLiveRoom(session.user.id, formData);
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
