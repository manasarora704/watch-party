import { useState, useRef } from "react";
import { Send, Smile, Image, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedChatInputProps {
  chat: string;
  setChat: (value: string) => void;
  onSend: () => void;
  reaction: string;
  setReaction: (value: string) => void;
  onGifSelect?: (gifUrl: string) => void;
  onEmojiSelect?: (emoji: string) => void;
}

const EMOJI_SUGGESTIONS = [
  "😀", "😂", "😍", "🤔", "😱",
  "👍", "❤️", "🔥", "🎉", "✨",
  "😎", "🚀", "💯", "🙌", "👏"
];

const POPULAR_GIFS = [
  { name: "Laughing", emoji: "😂" },
  { name: "Heart eyes", emoji: "😍" },
  { name: "Fire", emoji: "🔥" },
  { name: "Clapping", emoji: "👏" },
  { name: "Celebration", emoji: "🎉" },
];

export function EnhancedChatInput({
  chat,
  setChat,
  onSend,
  reaction,
  setReaction,
  onGifSelect,
  onEmojiSelect,
}: EnhancedChatInputProps) {
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const [showGifMenu, setShowGifMenu] = useState(false);
  const [gifQuery, setGifQuery] = useState("");
  const emojiMenuRef = useRef<HTMLDivElement>(null);
  const gifMenuRef = useRef<HTMLDivElement>(null);

  const handleEmojiClick = (emoji: string) => {
    setChat(chat + emoji);
    onEmojiSelect?.(emoji);
    setShowEmojiMenu(false);
  };

  const handleGifSelect = (gif: string) => {
    onGifSelect?.(gif);
    setShowGifMenu(false);
  };

  const handleSend = () => {
    if (chat.trim()) {
      onSend();
      setShowEmojiMenu(false);
      setShowGifMenu(false);
    }
  };

  return (
    <div className="border-t border-white/10 p-3">
      {/* Preview GIF if selected */}
      {/* GIF preview would go here */}

      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 focus-within:border-[#E50914]/70">
        {/* Emoji Picker Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowEmojiMenu(!showEmojiMenu);
              setShowGifMenu(false);
            }}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.04] text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Insert emoji"
            title="Emoji"
          >
            <Smile className="h-4 w-4" />
          </button>

          {/* Emoji Menu */}
          {showEmojiMenu && (
            <div
              ref={emojiMenuRef}
              className="absolute bottom-12 left-0 z-50 w-64 rounded-xl border border-white/10 bg-[#0A0E16]/95 p-3 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.95)] backdrop-blur-xl"
            >
              <div className="mb-2 text-xs font-semibold text-white/70">Quick reactions</div>
              <div className="grid grid-cols-5 gap-2">
                {EMOJI_SUGGESTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleEmojiClick(emoji)}
                    className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-lg transition hover:bg-white/10"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* GIF Picker Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowGifMenu(!showGifMenu);
              setShowEmojiMenu(false);
            }}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.04] text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Insert GIF"
            title="GIF"
          >
            <Image className="h-4 w-4" />
          </button>

          {/* GIF Menu */}
          {showGifMenu && (
            <div
              ref={gifMenuRef}
              className="absolute bottom-12 left-0 z-50 w-72 rounded-xl border border-white/10 bg-[#0A0E16]/95 p-3 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.95)] backdrop-blur-xl"
            >
              <div className="mb-2 text-xs font-semibold text-white/70">GIF reactions</div>
              <input
                type="text"
                value={gifQuery}
                onChange={(e) => setGifQuery(e.target.value)}
                placeholder="Search GIFs..."
                className="mb-2 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#E50914]/50"
              />
              <div className="space-y-2">
                {POPULAR_GIFS.map((gif) => (
                  <button
                    key={gif.name}
                    type="button"
                    onClick={() => handleGifSelect(gif.emoji)}
                    className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 transition hover:bg-white/10"
                  >
                    <span className="text-2xl">{gif.emoji}</span>
                    <span className="text-xs text-white/70">{gif.name}</span>
                  </button>
                ))}
              </div>
              <div className="mt-2 text-[10px] text-white/50">
                💡 Use emojis as GIF reactions for now
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <input
          value={chat}
          onChange={(event) => setChat(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleSend()}
          placeholder="Send a message..."
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
        />

        {/* Reaction Selector */}
        <input
          value={reaction}
          onChange={(event) => setReaction(event.target.value.toUpperCase().slice(0, 8))}
          aria-label="Reaction"
          className="w-16 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-center text-[11px] font-semibold text-white outline-none"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!chat.trim()}
          aria-label="Send chat message"
          className="grid h-9 w-9 place-items-center rounded-lg bg-[#E50914] text-white transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
