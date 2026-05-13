import type { Socket } from "socket.io";
import type { StructuredSocketError } from "../types/index.js";

export function emitSocketError(
  socket: Socket,
  code: StructuredSocketError["code"],
  message: string,
  details?: Record<string, unknown>,
) {
  socket.emit("error_message", { code, message, details });
}
