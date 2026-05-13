import type { Server } from "socket.io";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

/**
 * Socket.IO मिडलवेयर — कनेक्शन मेटाडेटा।
 * `JWT_SECRET` सेट होने पर यहाँ `jsonwebtoken` से `handshake.auth.token` वेरीफाई करें।
 */
export function registerSocketAuth(io: Server) {
  io.use((socket, next) => {
    socket.data.connectedAt = Date.now();
    if (env.JWT_SECRET && typeof socket.handshake.auth?.token !== "string") {
      logger.warn(
        "JWT_SECRET set but no handshake.auth.token — allowing (dev). Wire jwt.verify in production.",
      );
    }
    next();
  });
}
