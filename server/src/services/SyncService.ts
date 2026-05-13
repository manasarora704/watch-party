import type { Room } from "../rooms/Room.js";
import type { RoomSnapshot } from "../types/index.js";

/**
 * सर्वर authoritative playback सिंक — Room#getEffectivePlayback से ड्रिफ्ट कम होता है।
 */
export class SyncService {
  buildSyncPayload(room: Room): RoomSnapshot {
    return room.snapshot();
  }
}
