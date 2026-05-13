import type { Role } from "@/types/watchio";
import { Crown, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function RoleBadge({ role, size = "sm" }: { role: Role; size?: "sm" | "md" }) {
  const config = {
    host: {
      label: "Host",
      icon: Crown,
      cls: "bg-primary/14 text-primary border-primary/35 shadow-[0_0_16px_-8px_rgba(249,115,22,0.55)]",
    },
    moderator: {
      label: "Mod",
      icon: Shield,
      cls: "bg-[#22D3EE]/12 text-[#A5F3FC] border-[#22D3EE]/30 shadow-[0_0_16px_-8px_rgba(34,211,238,0.55)]",
    },
    participant: {
      label: "Viewer",
      icon: User,
      cls: "bg-white/[0.04] text-muted-foreground border-white/10",
    },
  }[role];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium backdrop-blur-md",
        size === "sm" ? "text-[10px]" : "text-xs",
        config.cls,
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {config.label}
    </span>
  );
}
