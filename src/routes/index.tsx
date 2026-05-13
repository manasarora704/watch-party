import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/watchio/Landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Watchio — Watch Together. In Perfect Sync." },
      {
        name: "description",
        content:
          "Watchio is a cinematic real-time YouTube watch party. Frame-perfect sync, live chat, reactions — your couch, everywhere.",
      },
      { property: "og:title", content: "Watchio — Watch Together. In Perfect Sync." },
      {
        property: "og:description",
        content: "A cinematic real-time YouTube watch party platform.",
      },
    ],
  }),
  component: Landing,
});
