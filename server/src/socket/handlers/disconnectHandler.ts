import type { HandlerContext } from "../context.js";
import { ServerEvents } from "../events.js";

export function registerDisconnectHandler(ctx: HandlerContext) {
  const { socket, rooms, sync } = ctx;

  socket.on("disconnect", () => {
    const entry = rooms.findParticipantBySocket(socket.id);
    if (!entry) return;
    const { room, participant } = entry;
    participant.disconnect();
    rooms.markParticipantDisconnected(socket.id);
    socket.to(room.id).emit(ServerEvents.USER_LEFT, {
      roomId: room.id,
      participantId: participant.id,
    });
    ctx.io.to(room.id).emit(ServerEvents.SYNC_STATE, sync.buildSyncPayload(room));
    rooms.unmapSocket(socket.id);
  });
}
