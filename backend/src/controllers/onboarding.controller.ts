import type { Request, Response } from "express";
import { ApiError } from "../errors/api-error";
import {
  completeOnboarding as completeOnboardingRecord,
  getOnboardingState,
  saveOnboardingActivities,
  saveOnboardingGoals,
  saveOnboardingLifestyle,
  saveOnboardingProfile,
} from "../models/onboarding.model";

const GOAL_CODES = new Set([
  "stress_management",
  "better_sleep",
  "daily_movement",
  "healthier_routines",
  "general_wellbeing",
]);

const ACTIVITY_CODES = new Set([
  "walking",
  "strength",
  "mobility",
  "yoga",
  "team_sport",
  "gentle_movement",
]);

const LIFESTYLE_CODES = new Set([
  "morning",
  "afternoon",
  "evening",
  "short_sessions",
  "flexible_sessions",
  "home",
  "outdoors",
  "gym",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getAuthenticatedUserId(request: Request): number {
  if (typeof request.authUserId !== "number") {
    throw new ApiError(401, "Authentication required.");
  }
  return request.authUserId;
}

function validateChoiceCodes(
  value: unknown,
  field: string,
  allowlist: Set<string>,
): string[] {
  if (!Array.isArray(value)) {
    throw new ApiError(400, "Please correct the highlighted fields.", {
      [field]: "Choose at least one option.",
    });
  }

  if (value.length === 0 || value.length > 10) {
    throw new ApiError(400, "Please correct the highlighted fields.", {
      [field]: "Choose between 1 and 10 options.",
    });
  }

  if (
    value.some((code) => typeof code !== "string") ||
    new Set(value).size !== value.length ||
    value.some((code) => !allowlist.has(code as string))
  ) {
    throw new ApiError(400, "Please correct the highlighted fields.", {
      [field]: "Choose only the available options.",
    });
  }

  return value as string[];
}

export function getOnboarding(
  request: Request,
  response: Response,
): void {
  const userId = getAuthenticatedUserId(request);
  const onboarding = getOnboardingState(userId);
  if (!onboarding) {
    throw new ApiError(401, "Authentication required.");
  }
  response.status(200).json({ onboarding });
}

export function saveProfile(
  request: Request,
  response: Response,
): void {
  const userId = getAuthenticatedUserId(request);
  const body = isRecord(request.body) ? request.body : {};
  const preferredName =
    typeof body.preferredName === "string"
      ? body.preferredName.trim()
      : "";
  const timezone =
    typeof body.timezone === "string" ? body.timezone.trim() : "";
  const details: Record<string, string> = {};

  if (preferredName.length < 2 || preferredName.length > 100) {
    details.preferredName =
      "Enter a preferred name between 2 and 100 characters.";
  }
  const timezonePattern = /^(?:UTC|[A-Za-z][A-Za-z0-9_+-]*(?:\/[A-Za-z0-9_+-]+)+)$/;
  if (
    timezone.length < 1 ||
    timezone.length > 64 ||
    !timezonePattern.test(timezone)
  ) {
    details.timezone = "Enter a valid timezone.";
  }
  if (Object.keys(details).length > 0) {
    throw new ApiError(400, "Please correct the highlighted fields.", details);
  }

  const onboarding = saveOnboardingProfile(userId, {
    preferredName,
    timezone,
  });
  if (!onboarding) {
    throw new ApiError(401, "Authentication required.");
  }
  response.status(200).json({ onboarding });
}

export function saveGoals(
  request: Request,
  response: Response,
): void {
  const userId = getAuthenticatedUserId(request);
  const body = isRecord(request.body) ? request.body : {};
  const codes = validateChoiceCodes(body.goals, "goals", GOAL_CODES);
  const onboarding = saveOnboardingGoals(userId, codes);
  if (!onboarding) {
    throw new ApiError(401, "Authentication required.");
  }
  response.status(200).json({ onboarding });
}

export function saveActivities(
  request: Request,
  response: Response,
): void {
  const userId = getAuthenticatedUserId(request);
  const body = isRecord(request.body) ? request.body : {};
  const codes = validateChoiceCodes(
    body.activities,
    "activities",
    ACTIVITY_CODES,
  );
  const onboarding = saveOnboardingActivities(userId, codes);
  if (!onboarding) {
    throw new ApiError(401, "Authentication required.");
  }
  response.status(200).json({ onboarding });
}

export function saveLifestyle(
  request: Request,
  response: Response,
): void {
  const userId = getAuthenticatedUserId(request);
  const body = isRecord(request.body) ? request.body : {};
  const codes = validateChoiceCodes(
    body.lifestyle,
    "lifestyle",
    LIFESTYLE_CODES,
  );
  const onboarding = saveOnboardingLifestyle(userId, codes);
  if (!onboarding) {
    throw new ApiError(401, "Authentication required.");
  }
  response.status(200).json({ onboarding });
}

export function completeOnboarding(
  request: Request,
  response: Response,
): void {
  const userId = getAuthenticatedUserId(request);
  const onboarding = getOnboardingState(userId);
  if (!onboarding) {
    throw new ApiError(401, "Authentication required.");
  }

  const details: Record<string, string> = {};
  if (
    onboarding.profile.preferredName.length < 2 ||
    onboarding.profile.timezone.length < 1
  ) {
    details.profile = "Complete your basic profile.";
  }
  if (onboarding.goals.length === 0) {
    details.goals = "Choose at least one wellness goal.";
  }
  if (onboarding.activities.length === 0) {
    details.activities = "Choose at least one activity preference.";
  }
  if (onboarding.lifestyle.length === 0) {
    details.lifestyle = "Choose at least one lifestyle preference.";
  }
  if (Object.keys(details).length > 0) {
    throw new ApiError(
      400,
      "Complete every onboarding section before finishing.",
      details,
    );
  }

  const completed = completeOnboardingRecord(userId);
  if (!completed) {
    throw new ApiError(401, "Authentication required.");
  }
  response.status(200).json({ onboarding: completed });
}
