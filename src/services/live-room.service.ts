// Importações necessárias para o serviço de salas ao vivo
import { prisma } from "@/lib/prisma"; // Cliente Prisma para banco de dados
import type { LiveRoomStatus } from "@prisma/client"; // Tipo de status de sala ao vivo

// Função para listar salas ao vivo do instrutor
// Retorna todas as salas criadas pelo instrutor
export async function listInstructorLiveRooms(instructorId: string) {
  return prisma.liveRoom.findMany({
    where: { instructorId },
    include: {
      course: { select: { id: true, title: true, slug: true } },
      instructor: { select: { id: true, username: true, fullName: true } },
      _count: { select: { participants: true } },
    },
    orderBy: { scheduledAt: "desc" },
  });
}

// Função para listar salas ao vivo disponíveis
// Retorna salas ao vivo ou agendadas
export async function listAvailableLiveRooms() {
  return prisma.liveRoom.findMany({
    where: {
      status: { in: ["SCHEDULED", "LIVE"] },
    },
    include: {
      course: { select: { id: true, title: true, slug: true } },
      instructor: { select: { id: true, username: true, fullName: true } },
      _count: { select: { participants: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });
}

// Função para obter sala ao vivo por ID
// Retorna sala com detalhes completos
export async function getLiveRoom(roomId: string) {
  return prisma.liveRoom.findUnique({
    where: { id: roomId },
    include: {
      course: { select: { id: true, title: true, slug: true } },
      instructor: { select: { id: true, username: true, fullName: true } },
      participants: {
        include: {
          user: { select: { id: true, username: true, fullName: true } },
        },
      },
    },
  });
}

// Função para criar sala ao vivo
// Cria nova sala ao vivo para instrutor
export async function createLiveRoom(
  instructorId: string,
  data: {
    title: string;
    description?: string;
    courseId?: string;
    videoUrl?: string;
    videoProvider?: string;
    scheduledAt: Date;
    maxParticipants?: number;
  },
) {
  // Se courseId foi fornecido, verificar se o curso existe
  if (data.courseId) {
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    });
    if (!course) {
      throw new Error("Curso não encontrado");
    }
  }

  return prisma.liveRoom.create({
    data: {
      instructorId,
      title: data.title,
      description: data.description,
      courseId: data.courseId || null, // Usa null se courseId estiver vazio
      videoUrl: data.videoUrl,
      videoProvider: data.videoProvider,
      scheduledAt: data.scheduledAt,
      maxParticipants: data.maxParticipants,
    },
    include: {
      course: { select: { id: true, title: true, slug: true } },
      instructor: { select: { id: true, username: true, fullName: true } },
    },
  });
}

// Função para atualizar sala ao vivo
// Atualiza dados da sala ao vivo
export async function updateLiveRoom(
  roomId: string,
  instructorId: string,
  data: {
    title?: string;
    description?: string;
    videoUrl?: string;
    videoProvider?: string;
    scheduledAt?: Date;
    maxParticipants?: number;
    status?: LiveRoomStatus;
  },
) {
  // Verifica se sala pertence ao instrutor
  const room = await prisma.liveRoom.findFirst({
    where: { id: roomId, instructorId },
  });
  if (!room) {
    throw new Error("Sala não encontrada ou você não é o instrutor.");
  }

  return prisma.liveRoom.update({
    where: { id: roomId },
    data,
    include: {
      course: { select: { id: true, title: true, slug: true } },
      instructor: { select: { id: true, username: true, fullName: true } },
    },
  });
}

// Função para iniciar sala ao vivo
// Muda status para LIVE e registra horário de início
export async function startLiveRoom(roomId: string, instructorId: string) {
  const room = await prisma.liveRoom.findFirst({
    where: { id: roomId, instructorId },
  });
  if (!room) {
    throw new Error("Sala não encontrada ou você não é o instrutor.");
  }

  return prisma.liveRoom.update({
    where: { id: roomId },
    data: {
      status: "LIVE",
      startedAt: new Date(),
    },
  });
}

// Função para encerrar sala ao vivo
// Muda status para ENDED e registra horário de término
export async function endLiveRoom(roomId: string, instructorId: string) {
  const room = await prisma.liveRoom.findFirst({
    where: { id: roomId, instructorId },
  });
  if (!room) {
    throw new Error("Sala não encontrada ou você não é o instrutor.");
  }

  return prisma.liveRoom.update({
    where: { id: roomId },
    data: {
      status: "ENDED",
      endedAt: new Date(),
    },
  });
}

// Função para entrar na sala ao vivo
// Adiciona usuário como participante
export async function joinLiveRoom(roomId: string, userId: string) {
  const room = await prisma.liveRoom.findUnique({
    where: { id: roomId },
  });
  if (!room) {
    throw new Error("Sala não encontrada.");
  }

  if (room.status !== "LIVE" && room.status !== "SCHEDULED") {
    throw new Error("Esta sala não está disponível para entrada.");
  }

  // Verifica se já é participante
  const existing = await prisma.liveRoomParticipant.findUnique({
    where: {
      roomId_userId: { roomId, userId },
    },
  });
  if (existing) {
    return existing;
  }

  // Verifica limite de participantes
  if (room.maxParticipants) {
    const participantCount = await prisma.liveRoomParticipant.count({
      where: { roomId, leftAt: null },
    });
    if (participantCount >= room.maxParticipants) {
      throw new Error("Sala lotada.");
    }
  }

  return prisma.liveRoomParticipant.create({
    data: { roomId, userId },
    include: {
      user: { select: { id: true, username: true, fullName: true } },
    },
  });
}

// Função para sair da sala ao vivo
// Remove usuário como participante
export async function leaveLiveRoom(roomId: string, userId: string) {
  return prisma.liveRoomParticipant.updateMany({
    where: {
      roomId,
      userId,
      leftAt: null,
    },
    data: { leftAt: new Date() },
  });
}

// Função para obter mensagens do chat
// Retorna mensagens da sala ao vivo
export async function getLiveChatMessages(roomId: string, limit = 50) {
  return prisma.liveChatMessage.findMany({
    where: { roomId },
    include: {
      user: { select: { id: true, username: true, fullName: true } },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
}

// Função para enviar mensagem no chat
// Cria nova mensagem no chat da sala
export async function sendLiveChatMessage(
  roomId: string,
  userId: string,
  message: string,
) {
  const room = await prisma.liveRoom.findUnique({
    where: { id: roomId },
  });
  if (!room) {
    throw new Error("Sala não encontrada.");
  }

  if (room.status !== "LIVE") {
    throw new Error("O chat só está disponível durante a transmissão ao vivo.");
  }

  // Verifica se usuário é participante
  const participant = await prisma.liveRoomParticipant.findUnique({
    where: {
      roomId_userId: { roomId, userId },
    },
  });
  if (!participant) {
    throw new Error("Você precisa entrar na sala para enviar mensagens.");
  }

  return prisma.liveChatMessage.create({
    data: { roomId, userId, message },
    include: {
      user: { select: { id: true, username: true, fullName: true } },
    },
  });
}

// Função para obter participantes ativos da sala
// Retorna participantes que ainda não saíram
export async function getActiveParticipants(roomId: string) {
  return prisma.liveRoomParticipant.findMany({
    where: { roomId, leftAt: null },
    include: {
      user: { select: { id: true, username: true, fullName: true } },
    },
    orderBy: { joinedAt: "asc" },
  });
}
