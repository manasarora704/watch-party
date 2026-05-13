import type { Role } from "./roles.js";

export type PlaybackState = {
  isPlaying: boolean;
  currentTime: number;
  videoId: string | null;
  videoTitle: string | null;
  updatedAt: number;
};

export type ChatMessage = {
  id: string;
  roomId: string;
  participantId: string;
  username: string;
  role: Role;
  text: string;
  emoji?: string;
  createdAt: number;
};

export type ParticipantSnapshot = {
  id: string;
  username: string;
  role: Role;
  socketId: string | null;
  connected: boolean;
  joinedAt: number;
};

export type RoomSnapshot = {
  id: string;
  name: string;
  participants: ParticipantSnapshot[];
  playback: PlaybackState;
  messages: ChatMessage[];
};
