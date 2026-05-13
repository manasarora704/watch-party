import { randomUUID } from "node:crypto";
import type { ChatMessage, PlaybackState, RoomSnapshot, Role } from "../types/index.js";
import { Participant } from "./Participant.js";

export class Room {
  readonly participants = new Map<string, Participant>();
  readonly messages: ChatMessage[] = [];
  hostParticipantId: string;
  playback: PlaybackState = {
    isPlaying: false,
    currentTime: 0,
    videoId: null,
    videoTitle: null,
    updatedAt: Date.now(),
  };

  constructor(
    public readonly id: string,
    public name: string,
    host: Participant,
  ) {
    this.participants.set(host.id, host);
    this.hostParticipantId = host.id;
  }

  addParticipant(participant: Participant) {
    this.participants.set(participant.id, participant);
  }

  rejoinParticipant(participant: Participant, socketId: string) {
    participant.reconnect(socketId);
    this.participants.set(participant.id, participant);
  }

  removeParticipant(participantId: string) {
    this.participants.delete(participantId);
    if (this.hostParticipantId === participantId) {
      const nextHost = this.participants.values().next().value as Participant | undefined;
      if (nextHost) {
        this.transferHost(nextHost.id);
      }
    }
  }

  updateRole(participantId: string, role: Role) {
    const participant = this.participants.get(participantId);
    if (participant) {
      participant.setRole(role);
    }
  }

  transferHost(participantId: string) {
    const nextHost = this.participants.get(participantId);
    if (!nextHost) {
      return false;
    }

    const previousHost = this.participants.get(this.hostParticipantId);
    if (previousHost && previousHost.id !== nextHost.id && previousHost.role === "host") {
      previousHost.setRole("moderator");
    }

    nextHost.setRole("host");
    this.hostParticipantId = nextHost.id;
    return true;
  }

  setPlayback(next: Partial<PlaybackState>) {
    this.playback = {
      ...this.playback,
      ...next,
      updatedAt: Date.now(),
    };
  }

  getEffectivePlayback() {
    if (!this.playback.isPlaying) {
      return this.playback;
    }

    const elapsedSeconds = (Date.now() - this.playback.updatedAt) / 1000;
    return {
      ...this.playback,
      currentTime: Math.max(0, this.playback.currentTime + elapsedSeconds),
    };
  }

  findParticipantByUsername(username: string) {
    const normalized = username.trim().toLowerCase();
    return (
      Array.from(this.participants.values()).find(
        (participant) => participant.username.trim().toLowerCase() === normalized,
      ) ?? null
    );
  }

  findParticipantById(participantId: string) {
    return this.participants.get(participantId) ?? null;
  }

  attachSocketToParticipant(participantId: string, socketId: string) {
    const participant = this.participants.get(participantId);
    if (!participant) {
      return null;
    }

    participant.reconnect(socketId);
    return participant;
  }

  disconnectParticipant(participantId: string) {
    const participant = this.participants.get(participantId);
    if (!participant) {
      return null;
    }

    participant.disconnect();
    return participant;
  }

  activeParticipants() {
    return Array.from(this.participants.values()).filter((participant) => participant.connected);
  }

  pushMessage(message: Omit<ChatMessage, "id" | "createdAt">) {
    this.messages.push({
      ...message,
      id: randomUUID(),
      createdAt: Date.now(),
    });
  }

  snapshot(): RoomSnapshot {
    const playback = this.getEffectivePlayback();
    return {
      id: this.id,
      name: this.name,
      participants: Array.from(this.participants.values()).map((participant) =>
        participant.snapshot(),
      ),
      playback,
      messages: this.messages,
    };
  }
}
