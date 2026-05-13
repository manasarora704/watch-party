import { createServer } from "node:http";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { PersistenceService } from "./services/PersistenceService.js";
import { RoomManager } from "./rooms/RoomManager.js";
import { createApp } from "./app.js";
import { attachSocketServer } from "./socket/socketServer.js";

const persistence = new PersistenceService();
const rooms = new RoomManager(persistence);

const app = createApp({ rooms, persistence });
const server = createServer(app);

attachSocketServer(server, { rooms, persistence });

server.listen(env.PORT, env.HOST, () => {
  logger.info(`Watchio API listening on http://${env.HOST}:${env.PORT}`);
});
