import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/65 backdrop-blur-lg"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-[#f97316] via-[#fb923c] to-[#fb7185] shadow-[0_12px_28px_-12px_rgba(249,115,22,0.9)] group-hover:shadow-[0_16px_40px_-12px_rgba(249,115,22,1)] transition">
              <Play className="h-5 w-5 fill-white text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-foreground">Watchio</span>
          </Link>

          <nav className="hidden items-center gap-10 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition hover:text-foreground">
              The Screen
            </a>
            <a href="#how" className="transition hover:text-foreground">
              Rooms
            </a>
            <a href="#showcase" className="transition hover:text-foreground">
              Archive
            </a>
          </nav>

          <Link
            to="/rooms"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_12px_30px_-12px_rgba(249,115,22,0.35)] transition hover:brightness-110"
          >
            Enter Lounge
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
