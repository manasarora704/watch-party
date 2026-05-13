export interface SessionData {
  username: string;
  roomId: string | null;
  myParticipantId: string | null;
  myRole: "host" | "moderator" | "participant";
  roomTitle: string;
  timestamp: number;
}

const SESSION_KEY = "watchio_session";
const SESSION_TTL = 24 * 60 * 60 * 1000;

export const sessionPersistence = {
  saveSession(data: SessionData) {
    if (typeof window === "undefined") return;
    try {
      const sessionData = {
        ...data,
        timestamp: Date.now(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    } catch (err) {
      console.warn("Failed to save session:", err);
    }
  },

  restoreSession(): SessionData | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return null;

      const session = JSON.parse(stored) as SessionData;

      if (Date.now() - session.timestamp > SESSION_TTL) {
        sessionPersistence.clearSession();
        return null;
      }

      return session;
    } catch (err) {
      console.warn("Failed to restore session:", err);
      sessionPersistence.clearSession();
      return null;
    }
  },

  clearSession() {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (err) {
      console.warn("Failed to clear session:", err);
    }
  },

  hasActiveRoom(): boolean {
    const session = sessionPersistence.restoreSession();
    return !!(session?.roomId);
  },
};

export const visibilityManager = {
  onPageVisible(callback: () => void) {
    if (typeof document === "undefined") return () => {};

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        callback();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", callback);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", callback);
    };
  },

  isVisible(): boolean {
    if (typeof document === "undefined") return true;
    return !document.hidden;
  },
};
