import type { HandlerContext } from "../context.js";
import { emitSocketError } from "../socketErrors.js";
import { ClientEvents, ServerEvents } from "../events.js";
import { assignRoleSchema, removeParticipantSchema } from "../../validators/index.js";

export function registerRoleHandlers(ctx: HandlerContext) {
  const { io, socket, rooms, persistence } = ctx;

  socket.on(ClientEvents.ASSIGN_ROLE, async (payload: unknown) => {
    const parsed = assignRoleSchema.safeParse(payload);
    if (!parsed.success) {
      emitSocketError(
        socket,
        "VALIDATION_ERROR",
        "Invalid role assignment payload",
        parsed.error.flatten(),
      );
      return;
    }
    const entry = rooms.findParticipantBySocket(socket.id);
    if (!entry || !ctx.permissions.canManageRoles(entry.participant.role)) {
      emitSocketError(socket, "UNAUTHORIZED", "You do not have permission to assign roles");
      return;
    }

    if (!ctx.permissions.canAssignRole(entry.participant.role, parsed.data.role)) {
      emitSocketError(
        socket,
        "UNAUTHORIZED",
        "Hosts can only assign Moderator or Participant roles, not Host role",
      );
      return;
    }

    const target = entry.room.findParticipantById(parsed.data.participantId);
    if (!target) {
      emitSocketError(socket, "PARTICIPANT_NOT_FOUND", "Participant not found in room");
      return;
    }

    if (parsed.data.role === "host") {
      const previousHost = entry.room.findParticipantById(entry.room.hostParticipantId);
      entry.room.transferHost(parsed.data.participantId);
      if (previousHost) {
        await persistence.saveParticipant(entry.room.id, previousHost);
      }
    } else {
      entry.room.updateRole(parsed.data.participantId, parsed.data.role);
    }

    await persistence.saveParticipant(entry.room.id, target);
    await persistence.saveRoom(entry.room);
    io.to(entry.room.id).emit(ServerEvents.ROLE_ASSIGNED, {
      roomId: entry.room.id,
      participantId: parsed.data.participantId,
      role: parsed.data.role,
    });
    io.to(entry.room.id).emit(ServerEvents.SYNC_STATE, ctx.sync.buildSyncPayload(entry.room));
  });

  socket.on(ClientEvents.REMOVE_PARTICIPANT, async (payload: unknown) => {
    const parsed = removeParticipantSchema.safeParse(payload);
    if (!parsed.success) {
      emitSocketError(
        socket,
        "VALIDATION_ERROR",
        "Invalid remove participant payload",
        parsed.error.flatten(),
      );
      return;
    }
    const entry = rooms.findParticipantBySocket(socket.id);
    if (!entry || !ctx.permissions.canRemoveParticipants(entry.participant.role)) {
      emitSocketError(socket, "UNAUTHORIZED", "You do not have permission to remove participants");
      return;
    }
    const target = entry.room.findParticipantById(parsed.data.participantId);
    if (!target) {
      emitSocketError(socket, "PARTICIPANT_NOT_FOUND", "Participant not found in room");
      return;
    }

    entry.room.removeParticipant(parsed.data.participantId);
    if (target.socketId) {
      const targetSocket = io.sockets.sockets.get(target.socketId);
      targetSocket?.emit(ServerEvents.PARTICIPANT_REMOVED, {
        roomId: entry.room.id,
        participantId: parsed.data.participantId,
      });
      targetSocket?.leave(entry.room.id);
      rooms.unmapSocket(target.socketId);
    }
    await persistence.deleteParticipant(parsed.data.participantId);
    await persistence.saveRoom(entry.room);
    io.to(entry.room.id).emit(ServerEvents.PARTICIPANT_REMOVED, {
      roomId: entry.room.id,
      participantId: parsed.data.participantId,
    });
    io.to(entry.room.id).emit(ServerEvents.SYNC_STATE, ctx.sync.buildSyncPayload(entry.room));
  });
}
