import type { RoomManager } from "../rooms/RoomManager.js";
import { generateRoomCode, normalizeRoomCode } from "../utils/generateRoomCode.js";

/** REST से कोड जनरेट करना (पहला वास्तविक जॉइन Socket पर होता है) */
export class RoomService {
  constructor(private readonly rooms: RoomManager) {}

  proposeRoom(name?: string) {
    const roomId = generateRoomCode();
    const trimmed = name?.trim();
    return {
      roomId,
      name: trimmed && trimmed.length > 0 ? trimmed : `Room ${roomId}`,
    };
  }

  async getRoomSummary(roomId: string) {
    const id = normalizeRoomCode(roomId);
    const room = this.rooms.findRoom(id) ?? (await this.rooms.hydrateRoom(id));
    if (!room) {
      return null;
    }
    const snapshot = room.snapshot();
    return {
      id: room.id,
      name: room.name,
      participantCount: snapshot.participants.length,
      playback: {
        videoId: snapshot.playback.videoId,
        videoTitle: snapshot.playback.videoTitle,
        isPlaying: snapshot.playback.isPlaying,
        currentTime: snapshot.playback.currentTime,
      },
    };
  }
}
