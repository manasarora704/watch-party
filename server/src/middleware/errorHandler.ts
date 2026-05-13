import type { NextFunction, Request, Response } from "express";
import type { StructuredSocketError } from "../types/index.js";

export function httpErrorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const payload: StructuredSocketError = {
    code: "UNKNOWN",
    message: err instanceof Error ? err.message : "Unexpected server error",
  };
  res.status(500).json(payload);
}
