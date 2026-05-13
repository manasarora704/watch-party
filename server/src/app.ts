import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { createHealthRouter } from "./routes/health.js";
import { createRoomsRouter } from "./routes/rooms.js";
import { httpErrorHandler } from "./middleware/errorHandler.js";
import type { RoomManager } from "./rooms/RoomManager.js";
import type { PersistenceService } from "./services/PersistenceService.js";
import { RoomService } from "./services/RoomService.js";

export type AppDeps = {
  rooms: RoomManager;
  persistence: PersistenceService;
};

function httpCorsOrigin(): boolean | string | string[] {
  const raw = env.CLIENT_ORIGIN?.split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  if (!raw?.length) return "*";
  return raw.length === 1 ? raw[0]! : raw;
}

export function createApp(deps: AppDeps) {
  const app = express();

  if (env.TRUST_PROXY === "1") {
    app.set("trust proxy", 1);
  }

  app.use(
    cors({
      origin: httpCorsOrigin(),
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(express.json());

  const roomService = new RoomService(deps.rooms);

  app.use(createHealthRouter());
  app.use(createRoomsRouter(roomService));
  app.use(httpErrorHandler);

  return app;
}
