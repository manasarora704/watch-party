import { z } from "zod";

export const joinRoomSchema = z.object({
  roomId: z.string().min(3).max(16),
  username: z.string().min(2).max(32),
  roomName: z.string().min(1).max(80).optional(),
  participantId: z.string().min(1).max(64).optional(),
  createIfMissing: z.boolean().optional().default(false),
});

export const leaveRoomSchema = z.object({
  roomId: z.string().min(3).max(16),
  participantId: z.string().min(1).optional(),
});

export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
export type LeaveRoomInput = z.infer<typeof leaveRoomSchema>;
