import type { HandlerContext } from "../context.js";
import { emitSocketError } from "../socketErrors.js";
import { ClientEvents, ServerEvents } from "../events.js";
import { playSchema, pauseSchema, seekSchema, changeVideoSchema } from "../../validators/index.js";
import { extractVideoId } from "../../utils/youtube.js";

export function registerPlaybackHandlers(ctx: HandlerContext) {
  const { socket, rooms, persistence, permissions, sync } = ctx;

  socket.on(ClientEvents.TICK, () => {
    const entry = rooms.findParticipantBySocket(socket.id);
    if (!entry) return;
    socket.emit(ServerEvents.SYNC_STATE, sync.buildSyncPayload(entry.room));
  });

  socket.on(ClientEvents.PLAY, async (payload: unknown) => {
    const parsed = playSchema.safeParse(payload);
    if (!parsed.success) {
      emitSocketError(socket, "VALIDATION_ERROR", "Invalid play payload", parsed.error.flatten());
      return;
    }
    const entry = rooms.findParticipantBySocket(socket.id);
    if (!entry || !permissions.canPlay(entry.participant.role)) {
      emitSocketError(socket, "UNAUTHORIZED", "You do not have permission to play the room");
      return;
    }
    entry.room.setPlayback({ isPlaying: true, currentTime: parsed.data.currentTime });
    await persistence.saveRoom(entry.room);
    ctx.io.to(entry.room.id).emit(ServerEvents.SYNC_STATE, sync.buildSyncPayload(entry.room));
  });

  socket.on(ClientEvents.PAUSE, async (payload: unknown) => {
    const parsed = pauseSchema.safeParse(payload);
    if (!parsed.success) {
      emitSocketError(socket, "VALIDATION_ERROR", "Invalid pause payload", parsed.error.flatten());
      return;
    }
    const entry = rooms.findParticipantBySocket(socket.id);
    if (!entry || !permissions.canPause(entry.participant.role)) {
      emitSocketError(socket, "UNAUTHORIZED", "You do not have permission to pause the room");
      return;
    }
    entry.room.setPlayback({ isPlaying: false, currentTime: parsed.data.currentTime });
    await persistence.saveRoom(entry.room);
    ctx.io.to(entry.room.id).emit(ServerEvents.SYNC_STATE, sync.buildSyncPayload(entry.room));
  });

  socket.on(ClientEvents.SEEK, async (payload: unknown) => {
    const parsed = seekSchema.safeParse(payload);
    if (!parsed.success) {
      emitSocketError(socket, "VALIDATION_ERROR", "Invalid seek payload", parsed.error.flatten());
      return;
    }
    const entry = rooms.findParticipantBySocket(socket.id);
    if (!entry || !permissions.canSeek(entry.participant.role)) {
      emitSocketError(socket, "UNAUTHORIZED", "You do not have permission to seek the room");
      return;
    }
    entry.room.setPlayback({ currentTime: parsed.data.currentTime });
    await persistence.saveRoom(entry.room);
    ctx.io.to(entry.room.id).emit(ServerEvents.SYNC_STATE, sync.buildSyncPayload(entry.room));
  });

  socket.on(ClientEvents.CHANGE_VIDEO, async (payload: unknown) => {
    const parsed = changeVideoSchema.safeParse(payload);
    if (!parsed.success) {
      emitSocketError(
        socket,
        "VALIDATION_ERROR",
        "Invalid change video payload",
        parsed.error.flatten(),
      );
      return;
    }
    const entry = rooms.findParticipantBySocket(socket.id);
    if (!entry || !permissions.canChangeVideo(entry.participant.role)) {
      emitSocketError(socket, "UNAUTHORIZED", "You do not have permission to change videos");
      return;
    }

    const videoId = extractVideoId(parsed.data.videoId);
    if (!videoId) {
      emitSocketError(socket, "VALIDATION_ERROR", "Enter a valid YouTube URL or video ID");
      return;
    }

    entry.room.setPlayback({
      videoId,
      videoTitle: parsed.data.videoTitle,
      currentTime: 0,
      isPlaying: false,
    });
    await persistence.saveRoom(entry.room);
    ctx.io.to(entry.room.id).emit(ServerEvents.SYNC_STATE, sync.buildSyncPayload(entry.room));
  });
}
