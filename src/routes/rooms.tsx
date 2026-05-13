import { createFileRoute } from "@tanstack/react-router";
import { Rooms } from "@/components/watchio/Rooms";

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "Create or Join — Watchio" },
      {
        name: "description",
        content: "Spin up a private theater or join friends with a 6-character code.",
      },
    ],
  }),
  component: Rooms,
});
