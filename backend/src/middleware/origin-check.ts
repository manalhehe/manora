import type { NextFunction, Request, Response } from "express";
import { getConfig } from "../config/env";
import { ApiError } from "../errors/api-error";

export function checkRequestOrigin(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  const origin = request.get("origin");
  if (origin && origin !== getConfig().frontendOrigin) {
    next(new ApiError(403, "Request origin is not allowed."));
    return;
  }
  next();
}
