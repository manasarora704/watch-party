import type { Role } from "../types/index.js";

export class PermissionService {
  canControlPlayback(role: Role) {
    return role === "host" || role === "moderator";
  }

  canPlay(role: Role) {
    return this.canControlPlayback(role);
  }

  canPause(role: Role) {
    return this.canControlPlayback(role);
  }

  canSeek(role: Role) {
    return this.canControlPlayback(role);
  }

  canChangeVideo(role: Role) {
    return this.canControlPlayback(role);
  }

  canManageRoles(role: Role) {
    return role === "host";
  }

  canAssignRole(role: Role, targetRole: Role) {
    if (role !== "host") return false;
    if (targetRole === "host") return false;
    return targetRole === "moderator" || targetRole === "participant";
  }

  canRemoveParticipants(role: Role) {
    return role === "host";
  }

  canTransferHost(role: Role) {
    return role === "host";
  }

  canSendMessage(role: Role) {
    return role === "host" || role === "moderator" || role === "participant";
  }
}
