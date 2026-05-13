import { create } from "zustand";
import { connectWatchioSocket, getWatchioSocket } from "@/socket/client";
import { sessionPersistence, visibilityManager } from "@/lib/session-persistence";
import type { ChatMessage, Participant, RoomSnapshot, Role } from "@/types/watchio";

type SyncStatus = "synced" | "syncing" | "offline";

interface WatchioState {
  username: string;
  myParticipantId: string | null;
  myRole: Role;
  roomId: string | null;
  roomTitle: string;
  videoTitle: string;
  videoId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackUpdatedAt: number;
  syncStatus: SyncStatus;
  participants: Participant[];
  messages: ChatMessage[];
  setUsername: (name: string) => void;
  createRoom: (title: string, name: string) => string;
  joinRoom: (id: string, name: string) => void;
  leaveRoom: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  tick: () => void;
  sendMessage: (text: string, emoji?: string) => void;
  setRole: (id: string, role: Role) => void;
  changeVideo: (videoId: string, videoTitle: string) => void;
  removeParticipant: (id: string) => void;
  hydrateFromSnapshot: (snapshot: RoomSnapshot) => void;
  setVideoDuration: (seconds: number) => void;
}

const palette = ["#f97316", "#22D3EE", "#fb7185", "#F59E0B", "#10B981", "#FDBA74"];
let socketInitialized = false;
let visibilityUnsubscribe: (() => void) | null = null;

const getColorForParticipant = (index: number) => palette[index % palette.length];

/**
 * Restore session on app load - auto-rejoin room if session exists
 */
const restoreSession = () => {
  const session = sessionPersistence.restoreSession();
  if (session && session.roomId) {
    useWatchio.setState({
      username: session.username,
      myParticipantId: session.myParticipantId,
      myRole: session.myRole,
      roomId: session.roomId,
      roomTitle: session.roomTitle,
      syncStatus: "syncing",
    });

    const socket = connectWatchioSocket();
    if (socket && !socket.connected) {
      socket.connect();
    }
  }
};

const setupVisibilityListener = () => {
  if (visibilityUnsubscribe) return;

  visibilityUnsubscribe = visibilityManager.onPageVisible(() => {
    console.log("Tab became visible - checking connection");
    const state = useWatchio.getState();
    const socket = getWatchioSocket();

    if (state.roomId && socket && !socket.connected) {
      console.log("Reconnecting to room:", state.roomId);
      socket.connect();
    }
  });
};

const ensureSocket = () => {
  const socket = connectWatchioSocket();
  if (!socket || socketInitialized) {
    return socket;
  }

  socketInitialized = true;

  socket.on("sync_state", (snapshot: RoomSnapshot) => {
    useWatchio.setState((state) => {
      const self =
        snapshot.participants.find((participant) => participant.username === state.username) ??
        snapshot.participants[0];
      return {
        roomId: snapshot.id,
        roomTitle: snapshot.name,
        myParticipantId: self?.id ?? state.myParticipantId,
        myRole: self?.role ?? state.myRole,
        participants: snapshot.participants.map((participant, index) => ({
          id: participant.id,
          name: participant.username,
          role: participant.role,
          color: getColorForParticipant(index),
          online: participant.connected,
        })),
        messages: snapshot.messages.map((message) => ({
          id: message.id,
          authorId: message.participantId,
          authorName: message.username,
          role: message.role,
          text: message.text,
          emoji: message.emoji,
          ts: message.createdAt,
        })),
        videoId: snapshot.playback.videoId,
        videoTitle: snapshot.playback.videoTitle ?? "Select a Video",
        isPlaying: snapshot.playback.isPlaying,
        currentTime: snapshot.playback.currentTime,
        playbackUpdatedAt: snapshot.playback.updatedAt,
        duration: state.duration,
        syncStatus: "synced",
      };
    });
  });

  socket.on("chat_message", (message: RoomSnapshot["messages"][number]) => {
    useWatchio.setState((state) => ({
      messages: state.messages.some((item) => item.id === message.id)
        ? state.messages
        : [
            ...state.messages,
            {
              id: message.id,
              authorId: message.participantId,
              authorName: message.username,
              role: message.role,
              text: message.text,
              emoji: message.emoji,
              ts: message.createdAt,
            },
          ],
    }));
  });

  socket.on("user_joined", () => {
    useWatchio.setState({ syncStatus: "syncing" });
  });

  socket.on("user_left", () => {
    useWatchio.setState({ syncStatus: "syncing" });
  });

  socket.on("role_assigned", () => {
    useWatchio.setState({ syncStatus: "syncing" });
  });

  socket.on("participant_removed", (payload: { participantId?: string }) => {
    const state = useWatchio.getState();
    if (payload.participantId === state.myParticipantId) {
      socket.disconnect();
      // Clear session if we were removed
      sessionPersistence.clearSession();
      useWatchio.setState({
        roomId: null,
        myParticipantId: null,
        myRole: "participant",
        syncStatus: "offline",
        participants: [],
        messages: [],
      });
      return;
    }
    useWatchio.setState({ syncStatus: "syncing" });
  });

  socket.on("error_message", (error: { code?: string; message?: string }) => {
    console.error("Socket error:", error);
    if (error.code === "ROOM_NOT_FOUND") {
      // Clear session if room doesn't exist anymore
      sessionPersistence.clearSession();
      useWatchio.setState({
        roomId: null,
        myParticipantId: null,
        myRole: "participant",
        syncStatus: "offline",
        participants: [],
        messages: [],
      });
      return;
    }
    useWatchio.setState({ syncStatus: "synced" });
  });

  socket.on("disconnect", () => {
    console.warn("Socket disconnected");
    // Only mark as offline, don't clear room data - we may reconnect
    useWatchio.setState({ syncStatus: "offline" });
  });

  socket.on("connect", () => {
    console.log("Socket connected");
    const state = useWatchio.getState();
    useWatchio.setState({ syncStatus: "syncing" });
    
    // If we have room info, try to rejoin (either new join or reconnect)
    if (state.roomId && state.username) {
      socket.emit("join_room", {
        roomId: state.roomId,
        username: state.username,
        participantId: state.myParticipantId ?? undefined,
        roomName: state.roomTitle || undefined,
        createIfMissing: state.myRole === "host",
      });
    }
  });

  socket.on("connect_error", (error) => {
    console.error("Connection error:", error);
    useWatchio.setState({ syncStatus: "offline" });
  });

  return socket;
};

export const useWatchio = create<WatchioState>((set, get) => ({
  username: "",
  myParticipantId: null,
  myRole: "participant",
  roomId: null,
  roomTitle: "Untitled Room",
  videoTitle: "Select a Video",
  videoId: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackUpdatedAt: 0,
  syncStatus: "offline",
  participants: [],
  messages: [],
  setUsername: (name) => set({ username: name }),
  createRoom: (title, name) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const socket = ensureSocket();
    const displayName = name.trim() || "Host";
    const roomName = title.trim() || `Room ${roomId}`;

    set({
      roomId,
      myParticipantId: null,
      roomTitle: roomName,
      username: displayName,
      myRole: "host",
      syncStatus: "syncing",
      participants: [],
      messages: [],
      videoId: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      playbackUpdatedAt: 0,
    });

    // Save session for persistence across tabs
    sessionPersistence.saveSession({
      username: displayName,
      roomId,
      myParticipantId: null,
      myRole: "host",
      roomTitle: roomName,
      timestamp: Date.now(),
    });

    // Setup visibility listener for tab switching
    setupVisibilityListener();

    if (socket && !socket.connected) {
      socket.connect();
    }

    if (socket?.connected) {
      socket.emit("join_room", {
        roomId,
        username: displayName,
        roomName,
        createIfMissing: true,
      });
    }

    return roomId;
  },
  joinRoom: (id, name) => {
    const roomId = id.toUpperCase();
    const socket = ensureSocket();
    const displayName = name.trim() || "Guest";

    set({
      roomId,
      myParticipantId: null,
      username: displayName,
      myRole: "participant",
      syncStatus: "syncing",
      participants: [],
      messages: [],
      videoId: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      playbackUpdatedAt: 0,
    });

    // Save session for persistence across tabs
    sessionPersistence.saveSession({
      username: displayName,
      roomId,
      myParticipantId: null,
      myRole: "participant",
      roomTitle: "Untitled Room",
      timestamp: Date.now(),
    });

    // Setup visibility listener for tab switching
    setupVisibilityListener();

    if (socket && !socket.connected) {
      socket.connect();
    }

    if (socket?.connected) {
      socket.emit("join_room", {
        roomId,
        username: displayName,
      });
    }
  },
  leaveRoom: () => {
    const socket = getWatchioSocket();
    const { roomId, myParticipantId } = get();
    if (socket?.connected && roomId) {
      socket.emit("leave_room", {
        roomId,
        participantId: myParticipantId ?? undefined,
      });
      socket.disconnect();
    }
    // Clear session when intentionally leaving
    sessionPersistence.clearSession();
    set({
      roomId: null,
      myParticipantId: null,
      syncStatus: "offline",
      participants: [],
      messages: [],
    });
  },
  togglePlay: () => {
    const { roomId, currentTime, isPlaying, myRole } = get();
    if (myRole !== "host" && myRole !== "moderator") {
      console.warn("You don't have permission to play/pause");
      return;
    }

    const socket = ensureSocket();
    if (socket?.connected && roomId) {
      socket.emit(isPlaying ? "pause" : "play", {
        roomId,
        currentTime,
      });
      set({ syncStatus: "syncing" });
    }
  },
  seek: (time) => {
    const { roomId, duration, myRole } = get();
    if (myRole !== "host" && myRole !== "moderator") {
      console.warn("You don't have permission to seek");
      return;
    }

    const cap = duration > 0 ? duration : 86400;
    const nextTime = Math.max(0, Math.min(time, cap));
    const socket = ensureSocket();
    if (socket?.connected && roomId) {
      socket.emit("seek", { roomId, currentTime: nextTime });
      set({ syncStatus: "syncing" });
    }
  },
  tick: () => {
    const { roomId } = get();
    const socket = ensureSocket();
    if (socket?.connected && roomId) {
      socket.emit("tick", { roomId });
      return;
    }
    if (socket && roomId && !socket.connected) {
      socket.connect();
    }
  },
  sendMessage: (text, emoji) => {
    const { roomId, myParticipantId } = get();
    const socket = ensureSocket();
    if (socket?.connected && roomId && text.trim()) {
      socket.emit("send_message", {
        roomId,
        participantId: myParticipantId ?? undefined,
        text: text.trim(),
        emoji: emoji || undefined,
      });
    }
  },
  setRole: (id, role) => {
    const { roomId, myRole } = get();
    if (myRole !== "host") {
      console.warn("Only host can assign roles");
      return;
    }

    const socket = ensureSocket();
    if (socket?.connected && roomId) {
      socket.emit("assign_role", {
        roomId,
        participantId: id,
        role,
      });
    }
  },
  changeVideo: (videoId, videoTitle) => {
    const { roomId, myRole } = get();
    if (myRole !== "host" && myRole !== "moderator") {
      console.warn("You don't have permission to change video");
      return;
    }

    const socket = ensureSocket();
    if (socket?.connected && roomId && videoId) {
      socket.emit("change_video", {
        roomId,
        videoId,
        videoTitle: videoTitle || "Untitled Video",
      });
      set({ syncStatus: "syncing" });
    }
  },
  removeParticipant: (id) => {
    const { roomId, myRole } = get();
    if (myRole !== "host") {
      console.warn("Only host can remove participants");
      return;
    }

    const socket = ensureSocket();
    if (socket?.connected && roomId) {
      socket.emit("remove_participant", {
        roomId,
        participantId: id,
      });
    }
  },
  hydrateFromSnapshot: (snapshot: RoomSnapshot) => {
    set((state) => {
      const self = snapshot.participants.find((p) => p.username === state.username);
      
      // Update session with participant ID when we get it
      if (state.roomId && state.username && self?.id) {
        sessionPersistence.saveSession({
          username: state.username,
          roomId: state.roomId,
          myParticipantId: self.id,
          myRole: self.role,
          roomTitle: snapshot.name,
          timestamp: Date.now(),
        });
      }
      
      return {
        roomId: snapshot.id,
        roomTitle: snapshot.name,
        myParticipantId: self?.id ?? null,
        participants: snapshot.participants.map((p, i) => ({
          id: p.id,
          name: p.username,
          role: p.role,
          color: getColorForParticipant(i),
          online: p.connected,
        })),
        messages: snapshot.messages.map((m) => ({
          id: m.id,
          authorId: m.participantId,
          authorName: m.username,
          role: m.role,
          text: m.text,
          emoji: m.emoji,
          ts: m.createdAt,
        })),
        videoId: snapshot.playback.videoId,
        videoTitle: snapshot.playback.videoTitle ?? "Select a Video",
        isPlaying: snapshot.playback.isPlaying,
        currentTime: snapshot.playback.currentTime,
        playbackUpdatedAt: snapshot.playback.updatedAt,
      };
    });
  },
  setVideoDuration: (seconds) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    set({ duration: seconds });
  },
}));

export { palette };
