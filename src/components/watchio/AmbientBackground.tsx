import { motion } from "framer-motion";

export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute -top-56 -left-48 h-[40rem] w-[40rem] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(249,115,22,0.92) 0%, rgba(249,115,22,0.22) 24%, transparent 68%)",
        }}
        animate={{ x: [0, 46, -18, 0], y: [0, 28, -18, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute top-1/4 -right-56 h-[34rem] w-[34rem] rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.72) 0%, rgba(34,211,238,0.16) 22%, transparent 68%)",
        }}
        animate={{ x: [0, -40, 22, 0], y: [0, -20, 28, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-56 left-1/3 h-[34rem] w-[34rem] rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(251,113,133,0.82) 0%, rgba(251,113,133,0.16) 20%, transparent 68%)",
        }}
        animate={{ x: [0, 34, -32, 0], y: [0, -34, 14, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.15]" />
      {/* particle dots */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white/40"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              width: 2 + (i % 3),
              height: 2 + (i % 3),
            }}
            animate={{ opacity: [0.1, 0.6, 0.1], y: [0, -20, 0] }}
            transition={{ duration: 6 + (i % 5), repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050505_82%)]" />
    </div>
  );
}
