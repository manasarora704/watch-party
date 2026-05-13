import { Participant } from "./Participant.js";
import { Room } from "./Room.js";
import type { PersistenceService } from "../services/PersistenceService.js";

export class RoomManager {
  private readonly rooms = new Map<string, Room>();
  private readonly socketToParticipant = new Map<
    string,
    { roomId: string; participantId: string }
  >();

  constructor(private readonly persistence?: PersistenceService) {}

  createRoom(roomId: string, name: string, host: Participant) {
    const room = new Room(roomId, name, host);
    this.rooms.set(roomId, room);
    if (host.socketId) {
      this.socketToParticipant.set(host.socketId, { roomId, participantId: host.id });
    }
    void this.persistence?.saveRoom(room);
    return room;
  }

  findRoom(roomId: string) {
    return this.rooms.get(roomId);
  }

  deleteRoom(roomId: string) {
    for (const [socketId, ref] of this.socketToParticipant.entries()) {
      if (ref.roomId === roomId) {
        this.socketToParticipant.delete(socketId);
      }
    }
    this.rooms.delete(roomId);
    void this.persistence?.deleteRoom(roomId);
  }

  /** इंटरव्यू / मॉनिटरिंग: खाली रूम मेमोरी + DB से हटाने के लिए (क्रॉन से कॉल कर सकते हैं) */
  cleanupEmptyRooms() {
    for (const [id, room] of this.rooms.entries()) {
      if (room.participants.size === 0) {
        this.deleteRoom(id);
      }
    }
  }

  registerParticipant(roomId: string, participant: Participant) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }
    room.addParticipant(participant);
    if (participant.socketId) {
      this.socketToParticipant.set(participant.socketId, { roomId, participantId: participant.id });
    }
    void this.persistence?.saveParticipant(roomId, participant);
    return room;
  }

  rejoinParticipant(roomId: string, participant: Participant, socketId: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }

    room.rejoinParticipant(participant, socketId);
    this.socketToParticipant.set(socketId, { roomId, participantId: participant.id });
    void this.persistence?.saveParticipant(roomId, participant);
    return room;
  }

  mapSocket(socketId: string, roomId: string, participantId: string) {
    this.socketToParticipant.set(socketId, { roomId, participantId });
  }

  unmapSocket(socketId: string) {
    this.socketToParticipant.delete(socketId);
  }

  findParticipantBySocket(socketId: string) {
    const ref = this.socketToParticipant.get(socketId);
    if (!ref) return null;
    const room = this.rooms.get(ref.roomId);
    const participant = room?.participants.get(ref.participantId);
    return room && participant ? { room, participant } : null;
  }

  markParticipantDisconnected(socketId: string) {
    const ref = this.socketToParticipant.get(socketId);
    if (!ref) {
      return null;
    }

    const room = this.rooms.get(ref.roomId);
    const participant = room?.disconnectParticipant(ref.participantId) ?? null;
    if (room && participant) {
      void this.persistence?.saveParticipant(room.id, participant);
    }
    return room && participant ? { room, participant } : null;
  }

  async hydrateRoom(roomId: string) {
    if (this.rooms.has(roomId)) {
      return this.rooms.get(roomId) ?? null;
    }

    if (!this.persistence) {
      return null;
    }

    const hydrated = await this.persistence.loadRoom(roomId);
    if (!hydrated) {
      return null;
    }

    this.rooms.set(roomId, hydrated);
    return hydrated;
  }
}
