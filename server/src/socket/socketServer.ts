import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import { RoomManager } from "../rooms/RoomManager.js";
import { PersistenceService } from "../services/PersistenceService.js";
import { PermissionService } from "../services/PermissionService.js";
import { ChatService } from "../services/ChatService.js";
import { SyncService } from "../services/SyncService.js";
import { registerSocketAuth } from "./middleware/authMiddleware.js";
import { registerRoomHandlers } from "./handlers/roomHandlers.js";
import { registerPlaybackHandlers } from "./handlers/playbackHandlers.js";
import { registerRoleHandlers } from "./handlers/roleHandlers.js";
import { registerChatHandlers } from "./handlers/chatHandlers.js";
import { registerDisconnectHandler } from "./handlers/disconnectHandler.js";
import type { HandlerContext } from "./context.js";

export type SocketServerDeps = {
  rooms: RoomManager;
  persistence: PersistenceService;
};

function socketCorsOrigin(): string[] | boolean {
  const raw = env.CLIENT_ORIGIN?.split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  return raw && raw.length > 0 ? raw : true;
}

export function attachSocketServer(server: HttpServer, deps: SocketServerDeps) {
  const io = new Server(server, {
    cors: {
      origin: socketCorsOrigin(),
      credentials: true,
    },
    transports: ["websocket", "polling"],
    allowEIO3: true,
  });

  const permissions = new PermissionService();
  const chat = new ChatService(deps.persistence);
  const sync = new SyncService();

  registerSocketAuth(io);

  io.on("connection", (socket) => {
    const ctx: HandlerContext = {
      io,
      socket,
      rooms: deps.rooms,
      persistence: deps.persistence,
      permissions,
      chat,
      sync,
    };
    registerRoomHandlers(ctx);
    registerPlaybackHandlers(ctx);
    registerRoleHandlers(ctx);
    registerChatHandlers(ctx);
    registerDisconnectHandler(ctx);
  });

  return io;
}

/** @deprecated बस पुराने इम्पोर्ट के लिए — `attachSocketServer` इस्तेमाल करें */
export const registerSocket = attachSocketServer;
