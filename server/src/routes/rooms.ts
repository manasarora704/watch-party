import { Router } from "express";
import { z } from "zod";
import type { RoomService } from "../services/RoomService.js";

export function createRoomsRouter(roomService: RoomService) {
  const router = Router();

  const createBody = z.object({
    name: z.string().max(80).optional(),
  });

  router.post("/rooms", (req, res) => {
    const parsed = createBody.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Invalid body",
        details: parsed.error.flatten(),
      });
    }
    const proposal = roomService.proposeRoom(parsed.data.name);
    return res.status(201).json(proposal);
  });

  router.get("/rooms/:id", async (req, res, next) => {
    try {
      const summary = await roomService.getRoomSummary(req.params.id);
      if (!summary) {
        return res.status(404).json({ code: "ROOM_NOT_FOUND", message: "Room not found" });
      }
      return res.json(summary);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
