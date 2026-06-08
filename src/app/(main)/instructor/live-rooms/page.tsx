// Importações necessárias para a página de salas ao vivo do instrutor
import { auth } from "@/auth"; // Função para obter sessão do usuário
import { isInstructor } from "@/lib/permissions"; // Função de verificação de permissão
import { LIVE_ROOM_STATUS_LABELS } from "@/lib/validations/live-room"; // Rótulos de status
import { listInstructorLiveRooms } from "@/services/live-room.service"; // Serviço para listar salas do instrutor
import Link from "next/link"; // Componente de link do Next.js
import { redirect } from "next/navigation"; // Função para redirecionar

// Página de salas ao vivo do instrutor
// Exibe salas criadas pelo instrutor, aplica tema azul e preto
export default async function InstructorLiveRoomsPage() {
  const session = await auth(); // Obtém sessão do usuário
  if (!session?.user?.id) redirect("/login?callbackUrl=/instructor/live-rooms"); // Redireciona se não estiver logado

  if (!isInstructor(session.user.roles)) {
    redirect("/instructor/courses"); // Redireciona se não for instrutor
  }

  const rooms = await listInstructorLiveRooms(session.user.id); // Busca salas do instrutor

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Minhas salas ao vivo</h1>
          <p className="mt-2 text-slate-300">
            Gerencie suas aulas ao vivo e interaja com seus alunos.
          </p>
        </div>
        <Link
          href="/instructor/live-rooms/new"
          className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8]"
          aria-label="Criar nova sala ao vivo"
        >
          Nova sala ao vivo
        </Link>
      </div>

      {rooms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#334155] p-10 text-center">
          <p className="text-slate-400">
            Você ainda não criou nenhuma sala ao vivo.
          </p>
          <Link
            href="/instructor/live-rooms/new"
            className="mt-4 inline-block text-sky-300 hover:underline"
            aria-label="Criar primeira sala ao vivo"
          >
            Criar primeira sala ao vivo
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((room: any) => {
            const isLive = room.status === "LIVE";
            const scheduledDate = new Date(room.scheduledAt);

            return (
              <Link
                key={room.id}
                href={`/live-rooms/${room.id}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-4 hover:border-sky-400/35"
                aria-label={`Gerenciar sala ${room.title}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{room.title}</h3>
                    {isLive && (
                      <span className="flex h-2 w-2">
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                      </span>
                    )}
                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                      isLive
                        ? "bg-red-900/20 text-red-400 border border-red-900/50"
                        : room.status === "SCHEDULED"
                        ? "bg-blue-900/20 text-blue-400 border border-blue-900/50"
                        : "bg-slate-800 text-slate-400 border border-gray-700"
                    }`}>
                      {LIVE_ROOM_STATUS_LABELS[room.status] || room.status}
                    </span>
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
                    👥 {room._count.participants} participantes
                  </p>
                </div>
                <span className="text-sm text-sky-300">Gerenciar →</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
