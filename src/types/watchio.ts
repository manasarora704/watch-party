export type Role = "host" | "moderator" | "participant";

export type Participant = {
  id: string;
  name: string;
  role: Role;
  color: string;
  online: boolean;
};

export type MessageReaction = {
  emoji: string;
  users: string[];
};

export type ChatMessage = {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  emoji?: string;
  gifUrl?: string;
  reactions?: MessageReaction[];
  ts: number;
  role: Role;
  deletedAt?: number;
  editedAt?: number;
  replyTo?: string;
};

export type RoomSnapshot = {
  id: string;
  name: string;
  participants: Array<{
    id: string;
    username: string;
    role: Role;
    socketId: string | null;
    connected: boolean;
    joinedAt: number;
  }>;
  playback: {
    isPlaying: boolean;
    currentTime: number;
    videoId: string | null;
    videoTitle: string | null;
    updatedAt: number;
  };
  messages: Array<{
    id: string;
    roomId: string;
    participantId: string;
    username: string;
    role: Role;
    text: string;
    emoji?: string;
    gifUrl?: string;
    reactions?: MessageReaction[];
    createdAt: number;
  }>;
};
