// Importações necessárias para validação
import { z } from "zod"; // Biblioteca de validação de schemas

// Schema de validação para criação de sala ao vivo
// Define regras para campos da sala ao vivo
export const createLiveRoomSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres").max(200),
  description: z.string().optional(),
  courseId: z.string().optional(),
  videoUrl: z
    .string()
    .optional()
    .refine((v) => !v || v === "" || z.url().safeParse(v).success, "URL inválida"),
  videoProvider: z.enum(["youtube", "vimeo", "other"]).optional(),
  scheduledAt: z.coerce.date({
    error: "Data e hora inválidas",
  }),
  maxParticipants: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number().int().min(1).max(1000).optional(),
  ),
});

// Schema de validação para atualização de sala ao vivo
// Define regras para campos atualizáveis
export const updateLiveRoomSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  courseId: z.string().optional(),
  videoUrl: z
    .string()
    .optional()
    .refine((v) => !v || v === "" || z.url().safeParse(v).success, "URL inválida"),
  videoProvider: z.enum(["youtube", "vimeo", "other"]).optional(),
  scheduledAt: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.date().optional(),
  ),
  maxParticipants: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number().int().min(1).max(1000).optional(),
  ),
  status: z.enum(["SCHEDULED", "LIVE", "ENDED", "CANCELLED"]).optional(),
});

// Schema de validação para mensagem do chat
// Define regras para mensagem
export const sendChatMessageSchema = z.object({
  message: z.string().min(1, "Mensagem não pode estar vazia").max(500),
});

// Tipos inferidos dos schemas para uso no código
export type CreateLiveRoomInput = z.infer<typeof createLiveRoomSchema>;
export type UpdateLiveRoomInput = z.infer<typeof updateLiveRoomSchema>;
export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;

// Rótulos para status de sala ao vivo
export const LIVE_ROOM_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Agendada",
  LIVE: "Ao vivo",
  ENDED: "Encerrada",
  CANCELLED: "Cancelada",
};
