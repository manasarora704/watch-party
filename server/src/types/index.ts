export type { Role } from "./roles.js";
export type { ChatMessage, ParticipantSnapshot, PlaybackState, RoomSnapshot } from "./room.js";

export type SocketErrorCode =
  | "ROOM_NOT_FOUND"
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "PARTICIPANT_NOT_FOUND"
  | "ROOM_FULL"
  | "UNKNOWN";

export type StructuredSocketError = {
  code: SocketErrorCode;
  message: string;
  details?: Record<string, unknown>;
};
