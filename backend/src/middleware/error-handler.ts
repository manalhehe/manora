import type { ErrorRequestHandler } from "express";
import { ApiError } from "../errors/api-error";

function hasErrorType(
  error: unknown,
  type: string,
): error is { type: string; status: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === type &&
    "status" in error &&
    typeof error.status === "number"
  );
}

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  if (error instanceof ApiError) {
    response.status(error.statusCode).json({
      error: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
    return;
  }

  if (hasErrorType(error, "entity.parse.failed")) {
    response.status(400).json({ error: "Request body must be valid JSON." });
    return;
  }

  if (hasErrorType(error, "entity.too.large")) {
    response.status(413).json({ error: "Request body is too large." });
    return;
  }

  console.error("Unhandled API error:", error);
  response.status(500).json({ error: "An unexpected server error occurred." });
};
