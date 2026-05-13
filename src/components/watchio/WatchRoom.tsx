import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  Check,
  Copy,
  Crown,
  Lock,
  MessageCircle,
  MoonStar,
  MoreHorizontal,
  Send,
  Shield,
  Sparkles,
  Users,
  Wifi,
  X,
  Smile,
  Image,
} from "lucide-react";
import { AmbientBackground } from "@/components/watchio/AmbientBackground";
import { RoleBadge } from "@/components/watchio/RoleBadge";
import { YouTubeStage } from "@/components/watchio/YouTubeStage";
import { cn } from "@/lib/utils";
import { connectWatchioSocket } from "@/socket/client";
import { useWatchio } from "@/store/watchio";
import type { ChatMessage, Participant, Role } from "@/types/watchio";

const avatarTones = [
  "bg-[#E50914]",
  "bg-[#22D3EE]",
  "bg-[#EC4899]",
  "bg-[#F59E0B]",
  "bg-[#10B981]",
  "bg-[#8B5CF6]",
];

const quickReactions = ["HYPE", "WOW", "LOL", "CLAP", "SCENE"];

function avatarToneFor(value: string) {
  const score = Array.from(value).reduce((total, char) => total + char.charCodeAt(0), 0);
  return avatarTones[score % avatarTones.length];
}

export function WatchRoom() {
  const { roomId: routeRoomId } = useParams({ from: "/room/$roomId" });
  const navigate = useNavigate();
  const {
    username,
    roomId,
    roomTitle,
    videoTitle,
    videoId,
    isPlaying,
    currentTime,
    duration,
    syncStatus,
    participants,
    messages,
    myRole,
    togglePlay,
    seek,
    tick,
    sendMessage,
    leaveRoom,
    changeVideo,
    setRole,
    removeParticipant,
    joinRoom,
  } = useWatchio();

  const [chat, setChat] = useState("");
  const [reaction, setReaction] = useState("HYPE");
  const [copied, setCopied] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const canControl = myRole === "host" || myRole === "moderator";
  const onlineParticipants = useMemo(
    () => participants.filter((participant) => participant.online),
    [participants],
  );

  useEffect(() => {
    connectWatchioSocket();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [tick]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const joinFromDirectLink = () => {
    joinRoom(routeRoomId, guestName);
  };

  const leaveAndExit = () => {
    leaveRoom();
    navigate({ to: "/rooms" });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(routeRoomId).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const onSend = () => {
    if (!chat.trim()) return;
    sendMessage(chat.trim(), reaction);
    setChat("");
  };

  if (!username || !roomId) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <AmbientBackground />
        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-5 py-20">
          <div className="grid w-full gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
            <div className="space-y-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white"
              >
                <MoonStar className="h-4 w-4" />
                Watchio
              </Link>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#E50914]">
                  Private watch room
                </p>
                <h1 className="mt-4 max-w-2xl text-5xl font-black tracking-tight text-white sm:text-7xl">
                  Enter the room before the opening scene.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-white/58">
                  Join room <span className="font-mono text-white">{routeRoomId}</span>. The
                  backend will sync the player, chat, roles, and participants as soon as you enter.
                </p>
              </div>
            </div>

            <div className="glass-strong rounded-2xl p-5 shadow-[0_40px_100px_-42px_rgba(0,0,0,1)]">
              <div className="aspect-video overflow-hidden rounded-xl bg-[linear-gradient(135deg,#32070b,#090909_55%,#171717)]">
                <div className="flex h-full items-end p-4">
                  <div className="h-1.5 w-full rounded-full bg-white/15">
                    <div className="h-full w-2/5 rounded-full bg-[#E50914]" />
                  </div>
                </div>
              </div>
              <label className="mt-5 block">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Display name
                </span>
                <input
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && joinFromDirectLink()}
                  placeholder="Your name"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-[#E50914]"
                />
              </label>
              <button
                onClick={joinFromDirectLink}
                className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#E50914] px-4 py-3 font-semibold text-white transition hover:brightness-110"
              >
                Enter Room
              </button>
              <Link
                to="/rooms"
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                Back to Lobby
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AmbientBackground />
      <div className="grid-bg pointer-events-none fixed inset-0 z-0 opacity-50" />

      <header className="fixed inset-x-0 top-0 z-40">
        <div className="mx-auto mt-3 max-w-[1800px] px-4">
          <div className="glass flex items-center justify-between gap-4 rounded-2xl px-4 py-3 shadow-[0_24px_70px_-34px_rgba(0,0,0,0.95)]">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                to="/"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#E50914] shadow-[0_14px_30px_-14px_rgba(229,9,20,1)]"
              >
                <MoonStar className="h-4 w-4 fill-white text-white" />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-2 truncate text-sm font-semibold">
                  <span className="truncate text-white">{roomTitle}</span>
                  <Lock className="h-3 w-3 text-white/40" />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-white/48">
                  <span className="flex items-center gap-1 text-[#22D3EE]">
                    <Wifi className="h-3 w-3" />
                    {syncStatus === "synced"
                      ? "Live sync"
                      : syncStatus === "syncing"
                        ? "Syncing"
                        : "Offline"}
                  </span>
                  <span>/</span>
                  <RoleBadge role={myRole} />
                  <span>/</span>
                  <span>{onlineParticipants.length} watching</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={leaveAndExit}
                className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/10 hover:text-white sm:inline-flex"
              >
                Leave
              </button>
              <button
                onClick={copyCode}
                className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs transition hover:bg-white/10 sm:inline-flex"
              >
                <span className="font-mono tracking-[0.22em] text-white">{routeRoomId}</span>
                {copied ? <Check className="h-3 w-3 text-[#22D3EE]" /> : <Copy className="h-3 w-3" />}
              </button>
              <IconShell label="Open participants" onClick={() => setShowParticipants(true)}>
                <Users className="h-4 w-4" />
              </IconShell>
              <IconShell label="Open chat" onClick={() => setShowChat(true)}>
                <MessageCircle className="h-4 w-4" />
              </IconShell>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {syncStatus !== "synced" ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed left-1/2 top-20 z-40 -translate-x-1/2 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs text-white/65 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl"
          >
            {syncStatus === "syncing" ? "Restoring room state..." : "Connection lost. Reconnecting..."}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <main className="relative z-10 mx-auto grid max-w-[1800px] gap-4 px-4 pb-6 pt-20 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px_380px]">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-w-0 space-y-4"
        >
          <YouTubeStage
            videoId={videoId}
            videoTitle={videoTitle}
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            roomTitle={roomTitle}
            canControl={canControl}
            syncStatus={syncStatus}
            onTogglePlay={togglePlay}
            onSeek={seek}
            onChangeVideo={changeVideo}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Now playing" value={videoTitle} toneClass="text-white" />
            <Stat
              label="In the room"
              value={`${onlineParticipants.length} watching`}
              toneClass="text-[#22D3EE]"
            />
            <Stat label="Your access" value={accessLabel(myRole)} toneClass="text-[#EC4899]" />
          </div>
        </motion.section>

        <aside className="hidden lg:block">
          <ParticipantsPanel
            username={username}
            participants={participants}
            myRole={myRole}
            onChangeRole={setRole}
            onRemove={removeParticipant}
          />
        </aside>

        <aside className="hidden xl:block">
          <ChatPanel
            chat={chat}
            setChat={setChat}
            reaction={reaction}
            setReaction={setReaction}
            onSend={onSend}
            onQuickReaction={(value) => sendMessage(value, value)}
            chatRef={chatRef}
            messages={messages}
            activeCount={onlineParticipants.length}
          />
        </aside>
      </main>

      <AnimatePresence>
        {showParticipants ? (
          <Drawer title="In the room" onClose={() => setShowParticipants(false)}>
            <ParticipantsPanel
              inDrawer
              username={username}
              participants={participants}
              myRole={myRole}
              onChangeRole={setRole}
              onRemove={removeParticipant}
            />
          </Drawer>
        ) : null}
        {showChat ? (
          <Drawer title="Live chat" onClose={() => setShowChat(false)}>
            <ChatPanel
              inDrawer
              chat={chat}
              setChat={setChat}
              reaction={reaction}
              setReaction={setReaction}
              onSend={onSend}
              onQuickReaction={(value) => sendMessage(value, value)}
              chatRef={chatRef}
              messages={messages}
              activeCount={onlineParticipants.length}
            />
          </Drawer>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function accessLabel(role: Role) {
  if (role === "host") return "Full control";
  if (role === "moderator") return "Playback control";
  return "Watch only";
}

function Stat({ label, value, toneClass }: { label: string; value: string; toneClass: string }) {
  return (
    <div className="glass rounded-2xl p-4 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.9)]">
      <div className="text-[10px] uppercase tracking-widest text-white/42">{label}</div>
      <div className={cn("mt-1 truncate text-sm font-semibold", toneClass)}>{value}</div>
    </div>
  );
}

function ParticipantsPanel({
  participants,
  username,
  myRole,
  onChangeRole,
  onRemove,
  inDrawer,
}: {
  participants: Participant[];
  username: string;
  myRole: Role;
  onChangeRole: (id: string, role: Role) => void;
  onRemove: (id: string) => void;
  inDrawer?: boolean;
}) {
  const canModerate = myRole === "host";
  const onlineCount = participants.filter((participant) => participant.online).length;

  return (
    <div
      className={cn(
        "glass flex flex-col rounded-2xl p-4 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.95)]",
        !inDrawer && "h-full",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">People</div>
          <div className="text-xs text-white/45">RBAC is enforced on the server.</div>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/55">
          {onlineCount} online
        </span>
      </div>

      <div
        className={cn(
          "mt-4 space-y-2 overflow-y-auto scrollbar-thin",
          !inDrawer && "max-h-[calc(100vh-220px)]",
        )}
      >
        {participants.map((participant) => {
          const isSelf = participant.name === username;
          return (
            <motion.div
              key={participant.id}
              layout
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.035] p-3 transition hover:bg-white/[0.07]"
            >
              <div className="relative">
                <div
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white shadow-[0_10px_22px_-12px_rgba(0,0,0,1)]",
                    avatarToneFor(participant.id + participant.name),
                  )}
                >
                  {participant.name[0]?.toUpperCase() ?? "?"}
                </div>
                {participant.online ? (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#070B14] bg-[#10B981]" />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate text-sm font-medium text-white">{participant.name}</div>
                  {isSelf ? (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/50">
                      You
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <RoleBadge role={participant.role} />
                  <span className="text-[11px] text-white/42">
                    {participant.online ? "Online" : "Away"}
                  </span>
                </div>
              </div>

              {canModerate && !isSelf ? (
                <div className="flex items-center gap-1.5">
                  {participant.role !== "host" ? (
                    <MiniActionButton
                      icon={Crown}
                      label="Make host"
                      onClick={() => onChangeRole(participant.id, "host")}
                    />
                  ) : null}
                  {participant.role !== "moderator" ? (
                    <MiniActionButton
                      icon={Shield}
                      label="Make moderator"
                      onClick={() => onChangeRole(participant.id, "moderator")}
                    />
                  ) : null}
                  {participant.role !== "participant" ? (
                    <MiniActionButton
                      icon={Users}
                      label="Make viewer"
                      onClick={() => onChangeRole(participant.id, "participant")}
                    />
                  ) : null}
                  <MiniActionButton
                    icon={MoreHorizontal}
                    label="Remove participant"
                    danger
                    onClick={() => onRemove(participant.id)}
                  />
                </div>
              ) : null}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ChatPanel({
  chat,
  setChat,
  reaction,
  setReaction,
  onSend,
  onQuickReaction,
  chatRef,
  messages,
  activeCount,
  inDrawer,
}: {
  chat: string;
  setChat: Dispatch<SetStateAction<string>>;
  reaction: string;
  setReaction: Dispatch<SetStateAction<string>>;
  onSend: () => void;
  onQuickReaction: (reaction: string) => void;
  chatRef: RefObject<HTMLDivElement | null>;
  messages: ChatMessage[];
  activeCount: number;
  inDrawer?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass flex flex-col rounded-2xl shadow-[0_24px_60px_-28px_rgba(0,0,0,0.95)]",
        inDrawer ? "h-[70vh]" : "h-[calc(100vh-7rem)]",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-white">✨ Live Chat</div>
          <div className="text-xs text-white/45">Real-time messaging with emojis & reactions</div>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] text-[#22D3EE]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22D3EE]" />
          {activeCount} active
        </span>
      </div>

      {/* Quick reaction buttons */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 px-4 py-3">
        {quickReactions.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onQuickReaction(item)}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            {item}
          </button>
        ))}
      </div>

      {/* Messages container */}
      <div ref={chatRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.025] px-4 py-6 text-center text-sm text-white/42">
            <div className="mb-2 text-2xl">💬</div>
            No messages yet. Start the watch party chatter!
          </div>
        ) : null}
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <div
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white",
                  avatarToneFor(message.authorId + message.authorName),
                )}
              >
                {message.authorName[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-white">{message.authorName}</span>
                  <RoleBadge role={message.role} />
                  <span className="text-[10px] text-white/38">{formatTimeLabel(message.ts)}</span>
                </div>
                
                {/* Message content - text */}
                {message.text && (
                  <div className="mt-1 inline-block max-w-full rounded-2xl rounded-tl-sm border border-white/5 bg-white/[0.055] px-3 py-2 text-sm text-white shadow-[0_12px_24px_-18px_rgba(0,0,0,0.8)]">
                    {message.text}
                    {message.emoji ? <span className="ml-2 text-base">{message.emoji}</span> : null}
                  </div>
                )}
                
                {/* Message content - GIF */}
                {message.gifUrl && (
                  <div className="mt-2 inline-block max-w-xs rounded-lg border border-white/10 overflow-hidden">
                    <img
                      src={message.gifUrl}
                      alt="GIF"
                      className="max-h-32 max-w-xs rounded-lg object-cover"
                    />
                  </div>
                )}

                {/* Message reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {message.reactions.map((reaction) => (
                      <button
                        key={reaction.emoji}
                        className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-xs transition hover:bg-white/10"
                        title={`Reacted by ${reaction.users.length} user${reaction.users.length > 1 ? 's' : ''}`}
                      >
                        <span>{reaction.emoji}</span>
                        {reaction.users.length > 1 && (
                          <span className="text-[10px] text-white/60">{reaction.users.length}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Enhanced chat input */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 focus-within:border-[#E50914]/70">
          {/* Emoji picker button */}
          <button
            type="button"
            onClick={() =>
              setReaction((current) => {
                const index = quickReactions.indexOf(current);
                return quickReactions[(index + 1) % quickReactions.length];
              })
            }
            className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.04] text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Cycle reaction"
            title="Cycle reaction"
          >
            <Smile className="h-4 w-4" />
          </button>
          
          {/* Chat input */}
          <input
            value={chat}
            onChange={(event) => setChat(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && onSend()}
            placeholder="Send a message... (supports emojis 😊)"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
          />
          
          {/* Reaction selector */}
          <input
            value={reaction}
            onChange={(event) => setReaction(event.target.value.toUpperCase().slice(0, 8))}
            aria-label="Reaction"
            className="w-16 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-center text-[11px] font-semibold text-white outline-none"
          />
          
          {/* Send button */}
          <button
            onClick={onSend}
            aria-label="Send chat message"
            className="grid h-9 w-9 place-items-center rounded-lg bg-[#E50914] text-white transition hover:brightness-110"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Drawer({
  onClose,
  title,
  children,
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 280 }}
        onClick={(event) => event.stopPropagation()}
        className="absolute inset-x-0 bottom-0 rounded-t-3xl border border-white/10 bg-[#070B14]/96 p-4 backdrop-blur-xl"
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-white/20" />
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/5 transition hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function IconShell({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden"
    >
      {children}
    </button>
  );
}

function MiniActionButton({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-full border transition",
        danger
          ? "border-rose-500/20 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
          : "border-white/10 bg-white/[0.04] text-white/55 hover:bg-white/10 hover:text-white",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function formatTimeLabel(value: number) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
