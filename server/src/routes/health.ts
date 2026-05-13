import { Router } from "express";

export function createHealthRouter() {
  const router = Router();
  router.get("/", (_req, res) => {
    res.json({
      ok: true,
      service: "watchio-server",
      health: "/health",
      realtime: "Socket.IO (same origin as this server)",
    });
  });
  router.get("/health", (_req, res) => {
    res.json({ ok: true, service: "watchio-server", ts: Date.now() });
  });
  return router;
}
