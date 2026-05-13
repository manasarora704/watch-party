export {
  joinRoomSchema,
  leaveRoomSchema,
  type JoinRoomInput,
  type LeaveRoomInput,
} from "./roomSchemas.js";
export {
  playSchema,
  pauseSchema,
  seekSchema,
  changeVideoSchema,
  type PlayInput,
  type PauseInput,
  type SeekInput,
  type ChangeVideoInput,
} from "./playbackSchemas.js";
export {
  assignRoleSchema,
  removeParticipantSchema,
  type AssignRoleInput,
  type RemoveParticipantInput,
} from "./roleSchemas.js";
export {
  sendMessageSchema,
  typingSchema,
  type SendMessageInput,
  type TypingInput,
} from "./chatSchemas.js";
