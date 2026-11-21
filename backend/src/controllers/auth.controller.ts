import type { Request, Response } from "express";
import { ApiError } from "../errors/api-error";
import {
  createUser,
  findUserByEmail,
  findUserById,
  type UserProfile,
} from "../models/user.model";
import {
  createAccessToken,
  hashPassword,
  verifyPassword,
} from "../services/auth.service";
import { getConfig } from "../config/env";

interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
  rememberMe: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeEmail(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? email
    : undefined;
}

function validateRegister(input: unknown): RegisterInput {
  const details: Record<string, string> = {};
  const body = isRecord(input) ? input : {};
  const fullName =
    typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";

  if (fullName.length < 2 || fullName.length > 100) {
    details.fullName = "Enter a name between 2 and 100 characters.";
  }
  if (!email) {
    details.email = "Enter a valid email address.";
  }
  if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    details.password = "Use at least 8 characters and no more than 72 bytes.";
  }
  if (Object.keys(details).length > 0) {
    throw new ApiError(400, "Please correct the highlighted fields.", details);
  }

  return { fullName, email: email!, password };
}

function validateLogin(input: unknown): LoginInput {
  const details: Record<string, string> = {};
  const body = isRecord(input) ? input : {};
  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  const rememberMe = body.rememberMe === true;

  if (!email) {
    details.email = "Enter a valid email address.";
  }
  if (!password || Buffer.byteLength(password, "utf8") > 72) {
    details.password = "Enter a valid password.";
  }
  if ("rememberMe" in body && typeof body.rememberMe !== "boolean") {
    details.rememberMe = "Choose whether to remember this device.";
  }
  if (Object.keys(details).length > 0) {
    throw new ApiError(400, "Please correct the highlighted fields.", details);
  }

  return { email: email!, password, rememberMe };
}

function setSessionCookie(
  response: Response,
  user: UserProfile,
  rememberMe = false,
): void {
  const { secureCookies } = getConfig();
  const maxAge = rememberMe
    ? 30 * 24 * 60 * 60 * 1000
    : 2 * 60 * 60 * 1000;
  response.cookie("manora_session", createAccessToken(user, rememberMe), {
    httpOnly: true,
    maxAge,
    path: "/api",
    sameSite: "lax",
    secure: secureCookies,
  });
}

export async function register(
  request: Request,
  response: Response,
): Promise<void> {
  const input = validateRegister(request.body);
  const passwordHash = await hashPassword(input.password);
  const user = createUser(input.fullName, input.email, passwordHash);

  if (!user) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  setSessionCookie(response, user);
  response.status(201).json({ user });
}

export async function login(
  request: Request,
  response: Response,
): Promise<void> {
  const input = validateLogin(request.body);
  const user = findUserByEmail(input.email);

  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new ApiError(401, "Email or password is incorrect.");
  }

  const profile: UserProfile = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    createdAt: user.createdAt,
  };
  setSessionCookie(response, profile, input.rememberMe);
  response.status(200).json({ user: profile });
}

export function getCurrentUser(
  request: Request,
  response: Response,
): void {
  if (typeof request.authUserId !== "number") {
    throw new ApiError(401, "Authentication required.");
  }

  const user = findUserById(request.authUserId);
  if (!user) {
    throw new ApiError(401, "Authentication required.");
  }
  response.status(200).json({ user });
}

export function logout(_request: Request, response: Response): void {
  const { secureCookies } = getConfig();
  response.clearCookie("manora_session", {
    httpOnly: true,
    path: "/api",
    sameSite: "lax",
    secure: secureCookies,
  });
  response.status(204).end();
}
