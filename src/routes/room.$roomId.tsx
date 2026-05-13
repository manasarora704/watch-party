import { createFileRoute } from "@tanstack/react-router";
import { WatchRoom } from "@/components/watchio/WatchRoom";

export const Route = createFileRoute("/room/$roomId")({
  head: () => ({
    meta: [
      { title: "Watch Room — Watchio" },
      { name: "description", content: "You're in the room. Press play together." },
    ],
  }),
  component: WatchRoom,
});
