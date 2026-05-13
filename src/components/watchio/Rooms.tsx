import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/watchio/Navbar";
import { AmbientBackground } from "@/components/watchio/AmbientBackground";
import { useWatchio } from "@/store/watchio";
import { Plus, LogIn, Sparkles, AlertCircle, CheckCircle } from "lucide-react";

export function Rooms() {
  const navigate = useNavigate();
  const { createRoom, joinRoom } = useWatchio();
  const [createName, setCreateName] = useState("");
  const [roomTitle, setRoomTitle] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [errors, setErrors] = useState<{ createName?: string; roomTitle?: string; joinName?: string; joinCode?: string }>({});

  // Validation for room creation
  const validateCreateRoom = () => {
    const newErrors: typeof errors = {};
    
    if (!createName.trim()) {
      newErrors.createName = "Your name is required";
    } else if (createName.trim().length < 2) {
      newErrors.createName = "Name must be at least 2 characters";
    }
    
    if (!roomTitle.trim()) {
      newErrors.roomTitle = "Room title is required";
    } else if (roomTitle.trim().length < 3) {
      newErrors.roomTitle = "Room title must be at least 3 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation for joining room
  const validateJoinRoom = () => {
    const newErrors: typeof errors = {};
    
    if (!joinName.trim()) {
      newErrors.joinName = "Your name is required";
    } else if (joinName.trim().length < 2) {
      newErrors.joinName = "Name must be at least 2 characters";
    }
    
    if (!joinCode.trim()) {
      newErrors.joinCode = "Room code is required";
    } else if (joinCode.trim().length < 3) {
      newErrors.joinCode = "Room code must be at least 3 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = () => {
    if (!validateCreateRoom()) return;
    const id = createRoom(roomTitle.trim(), createName.trim());
    navigate({ to: "/room/$roomId", params: { roomId: id } });
  };

  const handleJoin = () => {
    if (!validateJoinRoom()) return;
    joinRoom(joinCode.trim(), joinName.trim());
    navigate({ to: "/room/$roomId", params: { roomId: joinCode.trim().toUpperCase() } });
  };

  const isCreateValid = createName.trim().length >= 2 && roomTitle.trim().length >= 3;
  const isJoinValid = joinName.trim().length >= 2 && joinCode.trim().length >= 3;

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#181818] px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white/60">
            <Sparkles className="h-3.5 w-3.5 text-[#E50914]" />
            Watch party lobby
          </div>
          <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl">
            Start a room.
            <br />
            <span className="text-[#E50914]">Share the remote.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-white/55 max-w-xl mx-auto">
            Create a private screening or join friends with a room code. Playback permissions, live
            chat, and presence are enforced by the backend socket room.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* CREATE */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative"
          >
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#f97316]/20 to-[#22D3EE]/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
            <div className="relative rounded-2xl border border-white/10 bg-[#141414]/95 p-8 shadow-[0_24px_70px_-24px_rgba(0,0,0,1)] backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-[#E50914]/15 border border-[#E50914]/30">
                  <Plus className="h-5 w-5 text-[#E50914]" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-[#E50914] font-semibold">
                    Create
                  </div>
                  <h2 className="text-2xl font-semibold mt-0.5">Host a room</h2>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                Host a private watch party. Complete all required information below, then you'll have
                full control to manage participants and assign roles (Moderator or Viewer).
              </p>

              <div className="space-y-4">
                <Field 
                  label="Your name" 
                  required 
                  error={errors.createName}
                  isValid={createName.trim().length >= 2}
                >
                  <input
                    value={createName}
                    onChange={(e) => {
                      setCreateName(e.target.value);
                      if (errors.createName) setErrors({ ...errors, createName: undefined });
                    }}
                    placeholder="e.g. Alex"
                    className="w-full bg-transparent outline-none placeholder:text-muted-foreground/50 text-foreground"
                  />
                </Field>
                <Field 
                  label="Room title" 
                  required 
                  error={errors.roomTitle}
                  isValid={roomTitle.trim().length >= 3}
                >
                  <input
                    value={roomTitle}
                    onChange={(e) => {
                      setRoomTitle(e.target.value);
                      if (errors.roomTitle) setErrors({ ...errors, roomTitle: undefined });
                    }}
                    placeholder="Friday Night Cinema"
                    className="w-full bg-transparent outline-none placeholder:text-muted-foreground/50 text-foreground"
                  />
                </Field>

                {/* Info box about host permissions */}
                <div className="mt-6 rounded-lg border border-[#E50914]/20 bg-[#E50914]/5 p-3">
                  <div className="text-xs font-semibold text-[#E50914] mb-2">As the host, you can:</div>
                  <ul className="text-xs text-white/60 space-y-1">
                    <li>✓ Control video playback (play, pause, seek)</li>
                    <li>✓ Assign Moderator or Viewer roles</li>
                    <li>✓ Remove participants from the room</li>
                    <li>✓ Moderate the live chat</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={!isCreateValid}
                className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-[#E50914] text-white font-semibold py-3 shadow-[0_12px_30px_-12px_rgba(229,9,20,0.8)] transition disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 enabled:hover:brightness-110"
              >
                Create Room
              </button>
            </div>
          </motion.div>

          {/* JOIN */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative"
          >
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#22D3EE]/20 to-[#fb7185]/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
            <div className="relative rounded-2xl border border-white/10 bg-[#141414]/95 p-8 shadow-[0_24px_70px_-24px_rgba(0,0,0,1)] backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-[#22D3EE]/20 to-[#fb7185]/20 border border-[#22D3EE]/30">
                  <LogIn className="h-5 w-5 text-[#E50914]" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-[#E50914] font-semibold">
                    Join
                  </div>
                  <h2 className="text-2xl font-semibold mt-0.5">Join a premiere</h2>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                Got a code from a friend? Join the watch party. You'll get assigned as a Viewer by the host.
              </p>

              <div className="space-y-4">
                <Field 
                  label="Your name" 
                  required 
                  error={errors.joinName}
                  isValid={joinName.trim().length >= 2}
                >
                  <input
                    value={joinName}
                    onChange={(e) => {
                      setJoinName(e.target.value);
                      if (errors.joinName) setErrors({ ...errors, joinName: undefined });
                    }}
                    placeholder="e.g. Jordan"
                    className="w-full bg-transparent outline-none placeholder:text-muted-foreground/50 text-foreground"
                  />
                </Field>
                <Field 
                  label="Room code" 
                  required 
                  error={errors.joinCode}
                  isValid={joinCode.trim().length >= 3}
                >
                  <input
                    value={joinCode}
                    onChange={(e) => {
                      setJoinCode(e.target.value.toUpperCase().slice(0, 6));
                      if (errors.joinCode) setErrors({ ...errors, joinCode: undefined });
                    }}
                    placeholder="A1B2C3"
                    className="w-full bg-transparent font-mono text-lg tracking-[0.4em] outline-none placeholder:text-muted-foreground/50 uppercase text-foreground"
                  />
                </Field>
              </div>

              <button
                onClick={handleJoin}
                disabled={!isJoinValid}
                className="mt-8 inline-flex w-full items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] font-semibold py-3 text-foreground transition disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#E50914]/50 hover:bg-[#E50914]/10 enabled:hover:border-[#E50914]/50 enabled:hover:bg-[#E50914]/10"
              >
                Join Room
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Field({ 
  label, 
  required, 
  error, 
  isValid, 
  children 
}: { 
  label: string;
  required?: boolean;
  error?: string;
  isValid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
          {required && <span className="text-[#E50914] ml-1">*</span>}
        </span>
        {isValid && !error && (
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Valid
          </span>
        )}
      </div>
      <div className={`rounded-lg border px-4 py-3 backdrop-blur-sm transition focus-within:border-primary/35 ${
        error 
          ? 'border-rose-500/30 bg-rose-500/5 focus-within:bg-rose-500/10' 
          : isValid
          ? 'border-emerald-500/30 bg-emerald-500/5 focus-within:bg-emerald-500/10'
          : 'border-white/10 bg-white/[0.04] focus-within:bg-primary/10'
      }`}>
        {children}
      </div>
      {error && (
        <div className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </label>
  );
}
