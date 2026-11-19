import { resolve } from "node:path";

export interface AppConfig {
  port: number;
  frontendOrigin: string;
  jwtSecret: string;
  databasePath: string;
  secureCookies: boolean;
}

export function getConfig(): AppConfig {
  const jwtSecret = process.env.JWT_SECRET ?? "";
  if (Buffer.byteLength(jwtSecret, "utf8") < 32) {
    throw new Error("JWT_SECRET must be set to at least 32 bytes.");
  }

  const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
  let parsedOrigin: URL;
  try {
    parsedOrigin = new URL(frontendOrigin);
  } catch {
    throw new Error("FRONTEND_ORIGIN must be a valid HTTP or HTTPS origin.");
  }
  if (
    !["http:", "https:"].includes(parsedOrigin.protocol) ||
    parsedOrigin.origin !== frontendOrigin
  ) {
    throw new Error("FRONTEND_ORIGIN must contain only an HTTP or HTTPS origin.");
  }

  const port = Number(process.env.PORT ?? 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid TCP port.");
  }

  return {
    port,
    frontendOrigin,
    jwtSecret,
    databasePath: resolve(process.env.DATABASE_PATH ?? "./data/manora.sqlite"),
    secureCookies: process.env.NODE_ENV === "production",
  };
}
