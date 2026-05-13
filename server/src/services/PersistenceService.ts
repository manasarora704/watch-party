import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { Participant } from "../rooms/Participant.js";
import { Room } from "../rooms/Room.js";

type RoomRecord = Prisma.RoomGetPayload<{ include: { participants: true; messages: true } }>;
type ParticipantRecord = {
  id: string;
  username: string;
  role: string;
  socketId: string | null;
  connected: boolean;
  joinedAt: Date;
};
type ChatMessageRecord = {
  id: string;
  roomId: string;
  participantId: string;
  username: string;
  role: string;
  text: string;
  emoji: string | null;
  createdAt: Date;
};

export class PersistenceService {
  async saveRoom(room: Room) {
    await prisma.room.upsert({
      where: { id: room.id },
      create: {
        id: room.id,
        name: room.name,
        hostParticipantId: room.hostParticipantId,
        currentVideo: room.playback.videoId,
        currentVideoTitle: room.playback.videoTitle,
        currentTime: room.playback.currentTime,
        isPlaying: room.playback.isPlaying,
      },
      update: {
        name: room.name,
        hostParticipantId: room.hostParticipantId,
        currentVideo: room.playback.videoId,
        currentVideoTitle: room.playback.videoTitle,
        currentTime: room.playback.currentTime,
        isPlaying: room.playback.isPlaying,
      },
    });
  }

  async saveParticipant(roomId: string, participant: Participant) {
    await prisma.participant.upsert({
      where: { id: participant.id },
      create: {
        id: participant.id,
        username: participant.username,
        role: participant.role,
        roomId,
        socketId: participant.socketId,
        connected: participant.connected,
        joinedAt: new Date(participant.joinedAt),
      },
      update: {
        username: participant.username,
        role: participant.role,
        roomId,
        socketId: participant.socketId,
        connected: participant.connected,
      },
    });
  }

  async saveMessage(message: {
    id: string;
    roomId: string;
    participantId: string;
    username: string;
    role: string;
    text: string;
    emoji?: string;
    createdAt: number;
  }) {
    await prisma.chatMessage.create({
      data: {
        id: message.id,
        roomId: message.roomId,
        participantId: message.participantId,
        username: message.username,
        role: message.role,
        text: message.text,
        emoji: message.emoji,
        createdAt: new Date(message.createdAt),
      },
    });
  }

  async deleteParticipant(participantId: string) {
    await prisma.participant.deleteMany({ where: { id: participantId } });
  }

  async deleteRoom(roomId: string) {
    await prisma.room.deleteMany({ where: { id: roomId } });
  }

  async loadRoom(roomId: string) {
    const record = await prisma.room.findUnique({
      where: { id: roomId },
      include: { participants: true, messages: true },
    });

    if (!record) {
      return null;
    }

    return this.toDomainRoom(record);
  }

  private toDomainRoom(
    record: RoomRecord & { participants: ParticipantRecord[]; messages: ChatMessageRecord[] },
  ) {
    const hostRecord =
      record.participants.find(
        (participant: ParticipantRecord) => participant.id === record.hostParticipantId,
      ) ?? record.participants[0];
    if (!hostRecord) {
      return null;
    }

    const room = new Room(
      record.id,
      record.name,
      new Participant(
        hostRecord.id,
        hostRecord.username,
        hostRecord.role as "host" | "moderator" | "participant",
        hostRecord.socketId,
        hostRecord.connected,
        hostRecord.joinedAt.getTime(),
      ),
    );
    room.hostParticipantId = hostRecord.id;
    room.playback = {
      isPlaying: record.isPlaying,
      currentTime: record.currentTime,
      videoId: record.currentVideo,
      videoTitle: record.currentVideoTitle,
      updatedAt: Date.now(),
    };

    for (const participant of record.participants) {
      if (participant.id === hostRecord.id) {
        continue;
      }
      room.addParticipant(
        new Participant(
          participant.id,
          participant.username,
          participant.role as "host" | "moderator" | "participant",
          participant.socketId,
          participant.connected,
          participant.joinedAt.getTime(),
        ),
      );
    }

    room.messages.push(
      ...record.messages.map((message: ChatMessageRecord) => ({
        id: message.id,
        roomId: message.roomId,
        participantId: message.participantId,
        username: message.username,
        role: message.role as "host" | "moderator" | "participant",
        text: message.text,
        emoji: message.emoji ?? undefined,
        createdAt: message.createdAt.getTime(),
      })),
    );

    return room;
  }
}
