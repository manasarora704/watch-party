import { useState } from "react";
import { ExternalLink, Film, Link2, Settings2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { buildYouTubeWatchUrl, extractYouTubeVideoId } from "@/lib/youtube";

type SyncStatus = "synced" | "syncing" | "offline";

type YouTubeStageProps = {
  videoId: string | null;
  videoTitle: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  roomTitle: string;
  canControl: boolean;
  syncStatus: SyncStatus;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onChangeVideo: (videoId: string, videoTitle: string) => void;
};

export function YouTubeStage({
  videoId,
  videoTitle,
  roomTitle,
  canControl,
  syncStatus,
  onChangeVideo,
}: YouTubeStageProps) {
  const [sourceDraft, setSourceDraft] = useState("");
  const [titleDraft, setTitleDraft] = useState(videoTitle);
  const [showSettings, setShowSettings] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const normalizedVideoId = videoId ? extractYouTubeVideoId(videoId) : null;
  const iframeUrl = normalizedVideoId 
    ? `https://www.youtube.com/embed/${normalizedVideoId}?enablejsapi=1&fs=1` 
    : null;

  const handleChangeVideo = () => {
    const sourceId = extractYouTubeVideoId(sourceDraft);
    if (!sourceId) {
      setLoadError("Enter a valid YouTube URL or 11-character video ID.");
      return;
    }

    onChangeVideo(sourceId, titleDraft.trim() || "Untitled Video");
    setLoadError(null);
    setSourceDraft("");
    setShowSettings(false);
  };

  return (
    <div className="neon-border overflow-hidden rounded-2xl bg-black shadow-[0_40px_100px_-42px_rgba(0,0,0,1)]">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 bg-black/75 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/40">
            {roomTitle}
          </p>
          <h2 className="truncate text-base font-semibold text-white sm:text-lg">{videoTitle}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
              syncStatus === "offline"
                ? "bg-rose-500/15 text-rose-200"
                : syncStatus === "syncing"
                  ? "bg-amber-400/15 text-amber-100"
                  : "bg-emerald-500/15 text-emerald-100",
            )}
          >
            {syncStatus === "synced" ? "Live sync" : syncStatus}
          </span>
          {normalizedVideoId ? (
            <a
              href={buildYouTubeWatchUrl(normalizedVideoId)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <ExternalLink className="h-3 w-3" />
              YouTube
            </a>
          ) : null}
        </div>
      </div>

      {/* Video Player - Simple Iframe */}
      <div className="relative aspect-video w-full bg-black">
        {normalizedVideoId && iframeUrl ? (
          <iframe
            key={normalizedVideoId}
            src={iframeUrl}
            title={videoTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_center,#2a0b10_0%,#050505_62%)] px-6 text-center">
            <div className="max-w-md">
              <Film className="mx-auto mb-4 h-14 w-14 text-white/25" />
              <p className="text-lg font-semibold text-white">No video loaded</p>
              <p className="mt-2 text-sm text-white/52">
                Hosts and moderators can add a YouTube link from the video controls.
              </p>
              {canControl ? (
                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="mt-5 rounded-lg bg-[#E50914] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  Add video
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {loadError && (
        <div className="border-t border-white/10 bg-black/75 px-4 py-3 sm:px-5">
          <div className="rounded-lg border border-rose-500/40 bg-rose-950/90 px-3 py-2 text-xs text-rose-100">
            {loadError}
          </div>
        </div>
      )}

      {/* Video Settings Panel */}
      <AnimatePresence>
        {showSettings && canControl && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-t border-white/10 bg-black/75 px-4 py-4 sm:px-5"
          >
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-white/45">
                  YouTube link or ID
                </span>
                <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2">
                  <Link2 className="h-4 w-4 shrink-0 text-[#E50914]" />
                  <input
                    value={sourceDraft}
                    onChange={(event) => setSourceDraft(event.target.value)}
                    placeholder="https://youtu.be/..."
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-white/45">
                  Title
                </span>
                <input
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  placeholder="Movie night clip"
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35"
                />
              </label>
              <button
                type="button"
                onClick={handleChangeVideo}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#E50914] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
              >
                <Film className="h-4 w-4" />
                Apply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Settings Button */}
      {canControl && (
        <div className="border-t border-white/10 bg-black/75 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={() => setShowSettings((prev) => !prev)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-sm text-white transition hover:bg-white/15"
          >
            <Settings2 className="h-4 w-4" />
            {showSettings ? "Close" : "Change Video"}
          </button>
        </div>
      )}
    </div>
  );
}
