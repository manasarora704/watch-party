import type { Server, Socket } from "socket.io";
import type { RoomManager } from "../rooms/RoomManager.js";
import type { PersistenceService } from "../services/PersistenceService.js";
import type { PermissionService } from "../services/PermissionService.js";
import type { ChatService } from "../services/ChatService.js";
import type { SyncService } from "../services/SyncService.js";

export type HandlerContext = {
  io: Server;
  socket: Socket;
  rooms: RoomManager;
  persistence: PersistenceService;
  permissions: PermissionService;
  chat: ChatService;
  sync: SyncService;
};
