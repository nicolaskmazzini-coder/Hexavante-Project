import { z } from "zod";
import { COMMUNITY_TAGS } from "@/lib/community";

export const createDiscussionSchema = z.object({
  title: z.string().trim().min(5, "O título precisa de pelo menos 5 caracteres").max(120),
  body: z.string().trim().min(10, "Descreva sua dúvida com pelo menos 10 caracteres").max(2000),
  tags: z
    .array(z.enum(COMMUNITY_TAGS))
    .min(1, "Escolha pelo menos uma tag")
    .max(3, "Use no máximo 3 tags"),
});

export const addCommentSchema = z.object({
  activityId: z.string().min(1),
  content: z.string().trim().min(2, "Comentário muito curto").max(500),
});

export const acceptCommentSchema = z.object({
  activityId: z.string().min(1),
  commentId: z.string().min(1),
});

export const reactionSchema = z.object({
  activityId: z.string().min(1),
  type: z.enum(["CLAP", "FIRE", "IDEA"]),
});
