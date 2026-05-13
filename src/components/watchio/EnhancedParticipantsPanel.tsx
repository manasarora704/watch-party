import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Shield, User, X, Check, MoreHorizontal } from "lucide-react";
import { RoleBadge } from "@/components/watchio/RoleBadge";
import { RolePermissions } from "@/components/watchio/RolePermissions";
import type { Participant, Role } from "@/types/watchio";
import { cn } from "@/lib/utils";

interface EnhancedParticipantsPanelProps {
  participants: Participant[];
  username: string;
  myRole: Role;
  onChangeRole: (id: string, role: Role) => void;
  onRemove: (id: string) => void;
  inDrawer?: boolean;
}

function avatarToneFor(value: string) {
  const avatarTones = [
    "bg-[#E50914]",
    "bg-[#22D3EE]",
    "bg-[#EC4899]",
    "bg-[#F59E0B]",
    "bg-[#10B981]",
    "bg-[#8B5CF6]",
  ];
  const score = Array.from(value).reduce((total, char) => total + char.charCodeAt(0), 0);
  return avatarTones[score % avatarTones.length];
}

export function EnhancedParticipantsPanel({
  participants,
  username,
  myRole,
  onChangeRole,
  onRemove,
  inDrawer,
}: EnhancedParticipantsPanelProps) {
  const canModerate = myRole === "host";
  const onlineCount = participants.filter((p) => p.online).length;
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [showRoleMenu, setShowRoleMenu] = useState<string | null>(null);

  const hostCount = participants.filter((p) => p.role === "host").length;
  const modCount = participants.filter((p) => p.role === "moderator").length;
  const viewerCount = participants.filter((p) => p.role === "participant").length;

  return (
    <div
      className={cn(
        "glass flex flex-col rounded-2xl p-4 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.95)]",
        !inDrawer && "h-full",
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">👥 Participants</div>
          <div className="text-xs text-white/45">Role-based access control</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/55">
            {onlineCount}/{participants.length}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-3 grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="text-center">
          <div className="text-[10px] text-white/50">Hosts</div>
          <div className="text-xs font-semibold text-[#E50914]">{hostCount}</div>
        </div>
        <div className="text-center border-l border-r border-white/10">
          <div className="text-[10px] text-white/50">Mods</div>
          <div className="text-xs font-semibold text-[#22D3EE]">{modCount}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-white/50">Viewers</div>
          <div className="text-xs font-semibold text-white/70">{viewerCount}</div>
        </div>
      </div>

      {/* Participants List */}
      <div
        className={cn(
          "space-y-2 overflow-y-auto scrollbar-thin",
          !inDrawer && "max-h-[calc(100vh-280px)]",
        )}
      >
        {participants.map((participant) => {
          const isSelf = participant.name === username;
          const isSelected = selectedParticipant === participant.id;
          const isHost = participant.role === "host";

          return (
            <motion.div
              key={participant.id}
              layout
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "rounded-xl border transition",
                isSelected
                  ? "border-[#E50914]/50 bg-white/[0.08]"
                  : "border-white/5 bg-white/[0.035] hover:bg-white/[0.07]",
              )}
            >
              {/* Main participant row */}
              <div
                className="flex cursor-pointer items-center gap-3 p-3"
                onClick={() => setSelectedParticipant(isSelected ? null : participant.id)}
              >
                {/* Avatar */}
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
                  ) : (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#070B14] bg-white/30" />
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-medium text-white">{participant.name}</div>
                    {isSelf && (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/50">
                        You
                      </span>
                    )}
                    {isHost && (
                      <span className="rounded-full bg-[#E50914]/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-[#E50914] font-semibold">
                        Host
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <RoleBadge role={participant.role} />
                    <span className="text-[11px] text-white/42">
                      {participant.online ? "Online" : "Away"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {canModerate && !isSelf && !isHost && (
                  <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowRoleMenu(showRoleMenu === participant.id ? null : participant.id);
                        }}
                        className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/60 transition hover:bg-white/10 hover:text-white"
                        title="Change role (Moderator or Viewer only)"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {/* Role dropdown - only Moderator and Participant options */}
                      {showRoleMenu === participant.id && (
                        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-white/10 bg-[#0A0E16]/95 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.95)] backdrop-blur-xl overflow-hidden">
                          <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-white/50 font-semibold border-b border-white/10 bg-white/[0.02]">
                            Change Role
                          </div>
                          
                          {/* Moderator option */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onChangeRole(participant.id, "moderator");
                              setShowRoleMenu(null);
                            }}
                            className={cn(
                              "flex w-full items-center gap-2 px-3 py-2.5 text-sm transition border-b border-white/5",
                              participant.role === "moderator"
                                ? "bg-white/10 text-white font-semibold"
                                : "text-white/70 hover:bg-white/5 hover:text-white",
                            )}
                          >
                            {participant.role === "moderator" && (
                              <Check className="h-3.5 w-3.5 flex-shrink-0" />
                            )}
                            <Shield className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>Moderator</span>
                          </button>

                          {/* Participant/Viewer option */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onChangeRole(participant.id, "participant");
                              setShowRoleMenu(null);
                            }}
                            className={cn(
                              "flex w-full items-center gap-2 px-3 py-2.5 text-sm transition border-b border-white/5",
                              participant.role === "participant"
                                ? "bg-white/10 text-white font-semibold"
                                : "text-white/70 hover:bg-white/5 hover:text-white",
                            )}
                          >
                            {participant.role === "participant" && (
                              <Check className="h-3.5 w-3.5 flex-shrink-0" />
                            )}
                            <User className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>Viewer</span>
                          </button>

                          <div className="border-t border-white/10" />
                          
                          {/* Remove option */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemove(participant.id);
                              setShowRoleMenu(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-rose-100 transition hover:bg-rose-500/10"
                          >
                            <X className="h-3.5 w-3.5" />
                            Remove from room
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Host protection notice */}
                {canModerate && isHost && !isSelf && (
                  <div 
                    className="text-[10px] text-white/50 px-2 py-1 bg-white/5 rounded"
                    title="Host cannot be changed by other hosts"
                  >
                    Protected
                  </div>
                )}
              </div>

              {/* Expanded role details */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-white/10 p-3"
                >
                  <RolePermissions role={participant.role} showDetails={true} />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {participants.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.025] px-4 py-8 text-center text-sm text-white/42">
          <div className="mb-2 text-2xl">👥</div>
          No participants yet. Waiting for guests...
        </div>
      )}
    </div>
  );
}
