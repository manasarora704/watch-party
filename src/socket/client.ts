import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getWatchioSocket() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000", {
      autoConnect: false,
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    });
  }

  return socket;
}

export function connectWatchioSocket() {
  const instance = getWatchioSocket();
  instance?.connect();
  return instance;
}

export function disconnectWatchioSocket() {
  socket?.disconnect();
}

export function softDisconnectWatchioSocket() {
  if (socket) {
    socket.io.engine.close();
  }
}
