import type { HandlerContext } from "../context.js";
import { emitSocketError } from "../socketErrors.js";
import { ClientEvents, ServerEvents } from "../events.js";
import { sendMessageSchema, typingSchema } from "../../validators/index.js";

export function registerChatHandlers(ctx: HandlerContext) {
  const { io, socket, rooms, chat } = ctx;

  socket.on(ClientEvents.SEND_MESSAGE, async (payload: unknown) => {
    const parsed = sendMessageSchema.safeParse(payload);
    if (!parsed.success) {
      emitSocketError(
        socket,
        "VALIDATION_ERROR",
        "Invalid message payload",
        parsed.error.flatten(),
      );
      return;
    }
    const entry = rooms.findParticipantBySocket(socket.id);
    if (!entry || !ctx.permissions.canSendMessage(entry.participant.role)) {
      emitSocketError(socket, "UNAUTHORIZED", "You do not have permission to send messages");
      return;
    }
    const message = await chat.createMessage(
      entry.room,
      entry.participant,
      parsed.data.text,
      parsed.data.emoji,
    );
    io.to(entry.room.id).emit(ServerEvents.CHAT_MESSAGE, message);
  });

  socket.on(ClientEvents.TYPING, (payload: unknown) => {
    const parsed = typingSchema.safeParse(payload);
    if (!parsed.success) {
      return;
    }
    const entry = rooms.findParticipantBySocket(socket.id);
    if (!entry) return;

    socket.to(entry.room.id).emit(ServerEvents.TYPING_INDICATOR, {
      roomId: entry.room.id,
      participantId: entry.participant.id,
      username: entry.participant.username,
      typing: parsed.data.typing,
    });
  });
}
