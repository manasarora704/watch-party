import { motion } from "framer-motion";
import { X, RotateCcw } from "lucide-react";
import { RoleBadge } from "@/components/watchio/RoleBadge";
import type { ChatMessage } from "@/types/watchio";
import { cn } from "@/lib/utils";

interface EnhancedChatMessageProps {
  message: ChatMessage;
  avatarToneClass: string;
  showTimestamp?: boolean;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  currentUserId?: string;
}

const REACTION_EMOJIS = ["👍", "❤️", "😂", "🔥", "✨", "👏"];

export function EnhancedChatMessage({
  message,
  avatarToneClass,
  showTimestamp = true,
  canDelete = false,
  onDelete,
  onReact,
  currentUserId,
}: EnhancedChatMessageProps) {
  if (message.deletedAt) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 opacity-50"
      >
        <div
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white",
            avatarToneClass,
          )}
        >
          {message.authorName[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="text-xs italic text-white/40">Message deleted</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex items-start gap-3"
    >
      <div
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white",
          avatarToneClass,
        )}
      >
        {message.authorName[0]?.toUpperCase() ?? "?"}
      </div>

      <div className="min-w-0 flex-1">
        {/* Author info and badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-white">{message.authorName}</span>
          <RoleBadge role={message.role} />
          {message.editedAt && (
            <span className="text-[9px] text-white/40 italic">(edited)</span>
          )}
          {showTimestamp && (
            <span className="text-[10px] text-white/38">{formatTimeLabel(message.ts)}</span>
          )}
        </div>

        {/* Message content */}
        <div className="mt-1 space-y-2">
          {/* Text content */}
          {message.text && (
            <div className="inline-block max-w-full rounded-2xl rounded-tl-sm border border-white/5 bg-white/[0.055] px-3 py-2 text-sm text-white shadow-[0_12px_24px_-18px_rgba(0,0,0,0.8)] break-words">
              {message.text}
              {message.emoji && (
                <span className="ml-2 text-base">{message.emoji}</span>
              )}
            </div>
          )}

          {/* GIF content */}
          {message.gifUrl && (
            <div className="inline-block max-w-xs rounded-xl border border-white/10 overflow-hidden">
              <img
                src={message.gifUrl}
                alt="GIF"
                className="max-h-40 max-w-xs rounded-xl object-cover"
              />
            </div>
          )}

          {/* Reactions display */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {message.reactions.map((reaction) => (
                <button
                  key={reaction.emoji}
                  onClick={() => onReact?.(message.id, reaction.emoji)}
                  className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-xs transition hover:bg-white/10"
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-white/70">{reaction.users.length}</span>
                </button>
              ))}

              {/* Add reaction button */}
              {onReact && (
                <button
                  onClick={() => {
                    // Would show emoji picker
                    const emoji = REACTION_EMOJIS[0];
                    onReact(message.id, emoji);
                  }}
                  className="rounded-full border border-dashed border-white/20 bg-white/[0.02] px-2 py-1 text-xs text-white/50 transition hover:bg-white/[0.04] hover:text-white/70"
                  title="Add reaction"
                >
                  +
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons (on hover) */}
      {canDelete && (
        <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={() => onDelete?.(message.id)}
            className="grid h-6 w-6 place-items-center rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-100 transition hover:bg-rose-500/20"
            aria-label="Delete message"
            title="Delete"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </motion.div>
  );
}

function formatTimeLabel(value: number) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
