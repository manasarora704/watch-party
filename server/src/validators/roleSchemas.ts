import { z } from "zod";

export const assignRoleSchema = z.object({
  roomId: z.string().min(3).max(16).optional(),
  participantId: z.string().min(1),
  role: z.enum(["host", "moderator", "participant"]),
});

export const removeParticipantSchema = z.object({
  roomId: z.string().min(3).max(16).optional(),
  participantId: z.string().min(1),
});

export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
export type RemoveParticipantInput = z.infer<typeof removeParticipantSchema>;
