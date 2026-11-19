import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/api-error";
import { getTokenSubject } from "../services/auth.service";

declare global {
  namespace Express {
    interface Request {
      authUserId?: number;
    }
  }
}

export function requireAuth(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  const token: unknown = request.cookies?.manora_session;
  if (typeof token !== "string") {
    next(new ApiError(401, "Authentication required."));
    return;
  }

  const userId = getTokenSubject(token);
  if (!userId) {
    next(new ApiError(401, "Authentication required."));
    return;
  }

  request.authUserId = userId;
  next();
}
