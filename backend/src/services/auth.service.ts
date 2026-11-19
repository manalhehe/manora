import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getConfig } from "../config/env";
import type { UserProfile } from "../models/user.model";

const passwordRounds = 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, passwordRounds);
}

export function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function createAccessToken(
  user: UserProfile,
  rememberMe = false,
): string {
  const { jwtSecret } = getConfig();
  return jwt.sign({}, jwtSecret, {
    algorithm: "HS256",
    audience: "manora-web",
    expiresIn: rememberMe ? "30d" : "2h",
    issuer: "manora-api",
    subject: String(user.id),
  });
}

export function getTokenSubject(token: string): number | undefined {
  try {
    const payload = jwt.verify(token, getConfig().jwtSecret, {
      algorithms: ["HS256"],
      audience: "manora-web",
      issuer: "manora-api",
    });
    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      !/^[1-9]\d*$/.test(payload.sub)
    ) {
      return undefined;
    }

    const subject = Number(payload.sub);
    return Number.isSafeInteger(subject) ? subject : undefined;
  } catch {
    return undefined;
  }
}
