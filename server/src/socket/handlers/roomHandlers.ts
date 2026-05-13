import { randomUUID } from "node:crypto";
import type { HandlerContext } from "../context.js";
import { emitSocketError } from "../socketErrors.js";
import { ClientEvents, ServerEvents } from "../events.js";
import { joinRoomSchema, leaveRoomSchema } from "../../validators/index.js";
import { Participant } from "../../rooms/Participant.js";
import type { Room } from "../../rooms/Room.js";
import { normalizeRoomCode } from "../../utils/generateRoomCode.js";

export function registerRoomHandlers(ctx: HandlerContext) {
  const { io, socket, rooms, persistence, sync } = ctx;

  socket.on(ClientEvents.JOIN_ROOM, async (payload: unknown) => {
    const parsed = joinRoomSchema.safeParse(payload);
    if (!parsed.success) {
      emitSocketError(socket, "VALIDATION_ERROR", "Invalid join payload", parsed.error.flatten());
      return;
    }

    const { roomId, username, roomName, participantId, createIfMissing } = parsed.data;
    const normalizedRoomId = normalizeRoomCode(roomId);
    let room: Room | null = rooms.findRoom(normalizedRoomId) ?? null;

    if (!room) {
      room = await rooms.hydrateRoom(normalizedRoomId);
    }

    if (!room && !createIfMissing) {
      emitSocketError(socket, "ROOM_NOT_FOUND", "Room not found. Ask the host for a fresh room code.");
      return;
    }

    if (!room) {
      const hostParticipant = new Participant(
        participantId ?? randomUUID(),
        username,
        "host",
        socket.id,
        true,
      );
      room = rooms.createRoom(
        normalizedRoomId,
        roomName ?? `Room ${normalizedRoomId}`,
        hostParticipant,
      );
    } else {
      room.name = roomName?.trim() || room.name;
      const reconnectTarget = participantId ? room.findParticipantById(participantId) : null;
      const existingParticipant = reconnectTarget ?? room.findParticipantByUsername(username);

      if (existingParticipant) {
        room.rejoinParticipant(existingParticipant, socket.id);
        if (existingParticipant.username !== username) {
          existingParticipant.username = username;
        }
      } else {
        const newParticipant = new Participant(
          participantId ?? randomUUID(),
          username,
          room.participants.size === 0 ? "host" : "participant",
          socket.id,
          true,
        );
        rooms.registerParticipant(room.id, newParticipant);
      }
    }

    const resolved = rooms.findParticipantBySocket(socket.id);
    const participantRecord =
      resolved?.participant ??
      room.findParticipantByUsername(username) ??
      room.findParticipantById(participantId ?? "");
    if (!participantRecord) {
      emitSocketError(
        socket,
        "PARTICIPANT_NOT_FOUND",
        "Participant could not be attached to the room",
      );
      return;
    }

    rooms.mapSocket(socket.id, room.id, participantRecord.id);
    socket.join(room.id);
    await persistence.saveRoom(room);
    await persistence.saveParticipant(room.id, participantRecord);

    const snapshot = sync.buildSyncPayload(room);
    socket.emit(ServerEvents.SYNC_STATE, snapshot);
    socket.to(room.id).emit(ServerEvents.USER_JOINED, {
      roomId: room.id,
      participant: participantRecord.snapshot(),
    });
    io.to(room.id).emit(ServerEvents.SYNC_STATE, snapshot);
  });

  socket.on(ClientEvents.LEAVE_ROOM, async (payload: unknown) => {
    const parsed = leaveRoomSchema.safeParse(payload);
    if (!parsed.success) {
      emitSocketError(socket, "VALIDATION_ERROR", "Invalid leave payload", parsed.error.flatten());
      return;
    }

    const room = rooms.findRoom(normalizeRoomCode(parsed.data.roomId)) ?? null;
    if (!room) {
      emitSocketError(socket, "ROOM_NOT_FOUND", "Room not found");
      return;
    }

    const bySocket = rooms.findParticipantBySocket(socket.id);
    const participantRef = parsed.data.participantId
      ? room.findParticipantById(parsed.data.participantId)
      : (bySocket?.participant ?? null);
    const pid = participantRef?.id;
    if (!pid) {
      emitSocketError(socket, "PARTICIPANT_NOT_FOUND", "Participant not found in room");
      return;
    }

    room.removeParticipant(pid);
    rooms.unmapSocket(socket.id);
    socket.leave(room.id);
    await persistence.deleteParticipant(pid);
    await persistence.saveRoom(room);

    io.to(room.id).emit(ServerEvents.USER_LEFT, { roomId: room.id, participantId: pid });
    if (room.participants.size === 0) {
      rooms.deleteRoom(room.id);
    } else {
      io.to(room.id).emit(ServerEvents.SYNC_STATE, sync.buildSyncPayload(room));
    }
  });
}
