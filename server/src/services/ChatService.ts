import type { Room } from "../rooms/Room.js";
import type { Participant } from "../rooms/Participant.js";
import type { PersistenceService } from "./PersistenceService.js";

export class ChatService {
  constructor(private readonly persistence?: PersistenceService) {}

  async createMessage(room: Room, participant: Participant, text: string, emoji?: string) {
    room.pushMessage({
      roomId: room.id,
      participantId: participant.id,
      username: participant.username,
      role: participant.role,
      text,
      emoji,
    });

    const message = room.messages[room.messages.length - 1];
    await this.persistence?.saveMessage(message);
    return message;
  }
}
