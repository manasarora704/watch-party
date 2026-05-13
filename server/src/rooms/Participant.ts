import type { Role } from "../types/index.js";

export class Participant {
  lastSeenAt = Date.now();

  constructor(
    public readonly id: string,
    public username: string,
    public role: Role,
    public socketId: string | null,
    public connected = true,
    public joinedAt = Date.now(),
  ) {}

  reconnect(socketId: string) {
    this.socketId = socketId;
    this.connected = true;
    this.lastSeenAt = Date.now();
  }

  disconnect() {
    this.connected = false;
    this.socketId = null;
    this.lastSeenAt = Date.now();
  }

  setRole(role: Role) {
    this.role = role;
  }

  snapshot() {
    return {
      id: this.id,
      username: this.username,
      role: this.role,
      socketId: this.socketId,
      connected: this.connected,
      joinedAt: this.joinedAt,
    };
  }
}
