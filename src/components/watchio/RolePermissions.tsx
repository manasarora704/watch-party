import { Crown, Shield, User, Check, X } from "lucide-react";
import type { Role } from "@/types/watchio";
import { cn } from "@/lib/utils";

interface RolePermissionsProps {
  role: Role;
  showDetails?: boolean;
  compact?: boolean;
}

interface Permission {
  name: string;
  description: string;
  allowed: boolean;
}

interface RoleConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  permissions: Permission[];
  description: string;
}

const ROLE_CONFIGS: Record<Role, RoleConfig> = {
  host: {
    label: "Host",
    icon: Crown,
    color: "from-primary/20 to-primary/10",
    description: "Full control over the room, participants, and chat",
    permissions: [
      { name: "Change video", description: "Load and play new videos", allowed: true },
      { name: "Control playback", description: "Play, pause, seek", allowed: true },
      { name: "Manage participants", description: "Remove users, change roles", allowed: true },
      { name: "Moderate chat", description: "Delete messages, mute users", allowed: true },
      { name: "Room settings", description: "Change room title and settings", allowed: true },
      { name: "Send chat", description: "Send messages and reactions", allowed: true },
      { name: "Start watch party", description: "Create and manage room", allowed: true },
    ],
  },
  moderator: {
    label: "Moderator",
    icon: Shield,
    color: "from-cyan-500/20 to-cyan-400/10",
    description: "Moderate chat and assist with room management",
    permissions: [
      { name: "Change video", description: "Load and play new videos", allowed: false },
      { name: "Control playback", description: "Play, pause, seek", allowed: false },
      { name: "Manage participants", description: "Remove users, change roles", allowed: false },
      { name: "Moderate chat", description: "Delete messages, mute users", allowed: true },
      { name: "Room settings", description: "Change room title and settings", allowed: false },
      { name: "Send chat", description: "Send messages and reactions", allowed: true },
      { name: "Start watch party", description: "Create and manage room", allowed: false },
    ],
  },
  participant: {
    label: "Viewer",
    icon: User,
    color: "from-white/10 to-white/5",
    description: "Watch the video and participate in chat",
    permissions: [
      { name: "Change video", description: "Load and play new videos", allowed: false },
      { name: "Control playback", description: "Play, pause, seek", allowed: false },
      { name: "Manage participants", description: "Remove users, change roles", allowed: false },
      { name: "Moderate chat", description: "Delete messages, mute users", allowed: false },
      { name: "Room settings", description: "Change room title and settings", allowed: false },
      { name: "Send chat", description: "Send messages and reactions", allowed: true },
      { name: "Start watch party", description: "Create and manage room", allowed: false },
    ],
  },
};

export function RolePermissions({
  role,
  showDetails = false,
  compact = false,
}: RolePermissionsProps) {
  const config = ROLE_CONFIGS[role];
  const Icon = config.icon;

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold">
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-xl border border-white/10 bg-gradient-to-br p-4",
      config.color,
    )}>
      {/* Header */}
      <div className="mb-3 flex items-center gap-3">
        <div className="rounded-lg bg-white/10 p-2">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{config.label}</div>
          <div className="text-xs text-white/70">{config.description}</div>
        </div>
      </div>

      {/* Permissions */}
      {showDetails && (
        <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/50">
            Permissions
          </div>
          {config.permissions.map((permission) => (
            <div
              key={permission.name}
              className="flex items-start gap-3 rounded-lg bg-white/[0.02] p-2"
            >
              <div className="mt-0.5 flex-shrink-0">
                {permission.allowed ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <X className="h-3.5 w-3.5 text-white/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white">{permission.name}</div>
                <div className="text-[10px] text-white/50">{permission.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function RoleHierarchy() {
  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">
        Role Hierarchy
      </div>
      <div className="space-y-2">
        {(["host", "moderator", "participant"] as Role[]).map((role) => (
          <RolePermissions key={role} role={role} compact={true} />
        ))}
      </div>
    </div>
  );
}
