import { z } from "zod";

export const sendMessageSchema = z.object({
  roomId: z.string().min(3).max(16).optional(),
  participantId: z.string().min(1).optional(),
  text: z.string().min(1).max(500),
  emoji: z.string().max(8).optional(),
});

export const typingSchema = z.object({
  roomId: z.string().min(3).max(16).optional(),
  typing: z.boolean(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type TypingInput = z.infer<typeof typingSchema>;
