import { z } from "zod";

export const playSchema = z.object({
  roomId: z.string().min(3).max(16).optional(),
  currentTime: z.number().nonnegative(),
});

export const pauseSchema = playSchema;

export const seekSchema = z.object({
  roomId: z.string().min(3).max(16).optional(),
  currentTime: z.number().nonnegative(),
});

export const changeVideoSchema = z.object({
  roomId: z.string().min(3).max(16).optional(),
  videoId: z.string().min(3).max(128),
  videoTitle: z.string().min(1).max(200),
});

export type PlayInput = z.infer<typeof playSchema>;
export type PauseInput = z.infer<typeof pauseSchema>;
export type SeekInput = z.infer<typeof seekSchema>;
export type ChangeVideoInput = z.infer<typeof changeVideoSchema>;
