import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/watchio/Navbar";
import { AmbientBackground } from "@/components/watchio/AmbientBackground";
import { GlassCard } from "@/components/watchio/GlassCard";
import {
  Sparkles,
  Users,
  MessageCircle,
  Radio,
  Zap,
  Lock,
  Play,
  ArrowRight,
  Activity,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AmbientBackground />
      <Navbar />

      {/* HERO */}
      <section className="relative pt-32 pb-32 overflow-hidden">
        <div className="absolute inset-0 h-full max-h-[800px] w-full bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.16)_0%,transparent_70%)] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div
              variants={fadeUp}
              className="mx-auto mb-10 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground shadow-[0_16px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              Live premiere · Theatrical mode
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl font-bold leading-[1.15] sm:text-6xl md:text-7xl tracking-tight"
            >
              Cinema is better
              <br />
              <span className="italic font-light text-white/90">with company.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-8 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed"
            >
              Synchronized playback, high-fidelity spatial audio, and an intimate circle.
              <br className="hidden sm:block" />
              Reclaiming the theater experience from the noise of the web.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-12 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4"
            >
              <Link
                to="/rooms"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 font-semibold text-primary-foreground shadow-[0_16px_40px_-16px_rgba(249,115,22,0.35)] transition hover:brightness-110"
              >
                Host Premiere
              </Link>
              <Link
                to="/rooms"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-8 py-3.5 font-semibold text-foreground transition hover:border-primary/35 hover:bg-primary/10"
              >
                Join Lobby
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating preview */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto mt-20 max-w-5xl"
          >
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-r from-[#f97316]/40 via-[#22D3EE]/24 to-[#fb7185]/36 blur-3xl" />
            <div className="gradient-border rounded-2xl">
              <div className="rounded-2xl bg-black/75 p-3">
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#18181b] via-[#09090b] to-[#050505]">
                  {/* fake video */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.22),transparent_60%)]" />
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/10 backdrop-blur-xl glow-purple"
                  >
                    <Play className="h-10 w-10 fill-white text-white" />
                  </motion.div>
                  {/* hud */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full glass px-3 py-1 text-xs">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                    LIVE · Friday Night Cinema
                  </div>
                  <div className="absolute top-4 right-4 flex -space-x-2">
                    {["#f97316", "#22D3EE", "#fb7185", "#F59E0B"].map((c, i) => (
                      <div
                        key={i}
                        className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#0B1020] text-[10px] font-bold text-white"
                        style={{ background: c }}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  {/* progress */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="h-1 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#f97316] to-[#fb7185]"
                        initial={{ width: "20%" }}
                        animate={{ width: ["20%", "65%", "20%"] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* floating cards */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-6 -bottom-8 hidden md:block"
            >
              <div className="glass-strong w-56 rounded-2xl p-4">
                <div className="text-xs text-muted-foreground">Now playing</div>
                <div className="mt-1 text-sm font-semibold">Interstellar — Docking</div>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-[#22D3EE]">
                  <Activity className="h-3 w-3" /> Synced · 12ms drift
                </div>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -right-6 -top-8 hidden md:block"
            >
              <div className="glass-strong w-52 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#fb7185]/20 text-[#fecdd3]">
                    A
                  </span>
                  <span className="font-semibold">Aria</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">"this scene is unreal 🤯"</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.h2 variants={fadeUp} className="text-4xl font-bold sm:text-5xl">
              Built for the <span className="text-gradient">moments that matter</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-muted-foreground">
              Every detail engineered to make distance disappear.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="mt-16 grid gap-5 md:grid-cols-3"
          >
            {[
              {
                icon: Radio,
                title: "Frame-perfect Sync",
                desc: "Sub-second playback alignment across every device — no more 'wait, where are you?'",
                color: "#f97316",
              },
              {
                icon: MessageCircle,
                title: "Live Reactions",
                desc: "Floating emoji bursts, threaded replies, and typing indicators in a glassy chat layer.",
                color: "#22D3EE",
              },
              {
                icon: Users,
                title: "Roles & Control",
                desc: "Hand the remote to anyone. Hosts, moderators, viewers — all with cinematic badges.",
                color: "#fb7185",
              },
              {
                icon: Zap,
                title: "Instant Rooms",
                desc: "Spin up a private theater in one click. Share a 6-character code and you're in.",
                color: "#F59E0B",
              },
              {
                icon: Lock,
                title: "Private by Default",
                desc: "Rooms are ephemeral and end-to-end on the wire. Your watch parties stay yours.",
                color: "#10B981",
              },
              {
                icon: Sparkles,
                title: "Cinematic UI",
                desc: "Ambient glows, smooth motion, and a player that fades into the content.",
                color: "#fb7185",
              },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="h-full">
                  <div
                    className="grid h-12 w-12 place-items-center rounded-xl"
                    style={{ background: `${f.color}20`, boxShadow: `0 0 30px -8px ${f.color}80` }}
                  >
                    <f.icon className="h-5 w-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-4xl font-bold sm:text-5xl"
          >
            Three steps to <span className="text-gradient">showtime</span>
          </motion.h2>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create or Join",
                desc: "Spin up a fresh room or drop in with a 6-character code.",
                c: "#f97316",
              },
              {
                step: "02",
                title: "Drop a Link",
                desc: "Paste any YouTube URL. Watchio loads it in cinematic mode.",
                c: "#22D3EE",
              },
              {
                step: "03",
                title: "Press Play",
                desc: "Everyone sees the same frame. React, chat, repeat.",
                c: "#fb7185",
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <GlassCard>
                  <div
                    className="font-display text-6xl font-bold opacity-20"
                    style={{ color: s.c }}
                  >
                    {s.step}
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-muted-foreground">{s.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOWCASE */}
      <section id="showcase" className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold sm:text-5xl">
                Realtime that <span className="text-gradient">actually feels real</span>
              </h2>
              <p className="mt-5 text-muted-foreground">
                A pulse beats every 100ms across the room, keeping playback within a single frame.
                When the host pauses, the world pauses. When a friend reacts, you feel the ripple.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  ["12ms", "Average sync drift"],
                  ["100ms", "Pulse interval"],
                  ["∞", "Hours we'll spend together"],
                ].map(([n, l]) => (
                  <div key={l} className="flex items-baseline gap-4">
                    <span className="font-display text-3xl font-bold text-gradient">{n}</span>
                    <span className="text-sm text-muted-foreground">{l}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <GlassCard className="p-0">
                <div className="border-b border-white/5 p-4 text-xs text-muted-foreground flex items-center justify-between">
                  <span>Live Chat</span>
                  <span className="flex items-center gap-1 text-[#22D3EE]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22D3EE]" />4
                    watching
                  </span>
                </div>
                <div className="space-y-3 p-5">
                  {[
                    { n: "Aria", c: "#22D3EE", t: "this scene is unreal 🤯", d: 0 },
                    { n: "Kenji", c: "#fb7185", t: "rewind pls", d: 0.3 },
                    { n: "Lina", c: "#F59E0B", t: "the soundtrack 🔥", d: 0.6 },
                    { n: "You", c: "#f97316", t: "omg right?", d: 0.9 },
                  ].map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: m.d }}
                      className="flex items-start gap-3"
                    >
                      <div
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: m.c }}
                      >
                        {m.n[0]}
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">{m.n}</div>
                        <div className="mt-0.5 text-sm">{m.t}</div>
                      </div>
                    </motion.div>
                  ))}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </span>
                    Marco is typing…
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl glass-strong p-12 sm:p-16"
          >
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#f97316]/20 via-transparent to-[#fb7185]/20" />
            <h2 className="text-4xl font-bold sm:text-6xl">
              Your couch, <span className="text-gradient">everywhere.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
              Open a room. Send a link. Press play. That's the whole pitch.
            </p>
            <Link
              to="/rooms"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f97316] to-[#fb7185] px-8 py-4 font-semibold text-white shadow-[0_10px_50px_-10px_rgba(249,115,22,0.8)] transition hover:shadow-[0_10px_60px_-5px_rgba(251,113,133,0.7)]"
            >
              <Play className="h-4 w-4 fill-white" />
              Start Watching Together
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-10">
        <div className="mx-auto max-w-7xl px-6 text-center text-xs text-muted-foreground">
          Watchio · Watch Together. Feel Together.
        </div>
      </footer>
    </div>
  );
}
