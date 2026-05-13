import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { useWatchio } from "@/store/watchio";
import { sessionPersistence, visibilityManager } from "@/lib/session-persistence";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute -top-40 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-[#f97316]/28 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-[30rem] w-[30rem] rounded-full bg-[#22D3EE]/16 blur-3xl" />
      <div className="relative z-10 max-w-md text-center">
        <div className="font-display text-[10rem] font-bold leading-none text-gradient">404</div>
        <h2 className="mt-2 text-2xl font-semibold">This room doesn't exist</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          The link's broken or the show's over. Let's get you back to the lobby.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/"
            className="rounded-full bg-gradient-to-r from-[#f97316] to-[#fb7185] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_40px_-10px_rgba(249,115,22,0.7)]"
          >
            Back home
          </Link>
          <Link
            to="/rooms"
            className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold backdrop-blur-md hover:bg-white/10"
          >
            Start a room
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#050505" },
      { title: "Watchio — Watch Together. Feel Together." },
      { name: "description", content: "Cinematic real-time YouTube watch party platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    const session = sessionPersistence.restoreSession();
    if (session && session.roomId) {
      console.log("Restoring session:", session.roomId);
      useWatchio.setState({
        username: session.username,
        myParticipantId: session.myParticipantId,
        myRole: session.myRole,
        roomId: session.roomId,
        roomTitle: session.roomTitle,
        syncStatus: "syncing",
      });

      const unsubscribe = visibilityManager.onPageVisible(() => {
        console.log("Tab became visible - checking connection");
        const state = useWatchio.getState();
        const { getWatchioSocket, connectWatchioSocket } = require("@/socket/client");

        const socket = getWatchioSocket();
        if (state.roomId && socket && !socket.connected) {
          console.log("Reconnecting to room:", state.roomId);
          connectWatchioSocket();
        }
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
