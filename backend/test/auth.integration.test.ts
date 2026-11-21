import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { test } from "node:test";
import type { AddressInfo } from "node:net";

test("registration, login, current user, logout, and origin protection", async () => {
  const tempDirectory = mkdtempSync(join(tmpdir(), "manora-auth-"));
  const frontendOrigin = "http://localhost:5173";
  process.env.DATABASE_PATH = join(tempDirectory, "auth.sqlite");
  process.env.FRONTEND_ORIGIN = frontendOrigin;
  process.env.JWT_SECRET = randomBytes(32).toString("hex");
  process.env.NODE_ENV = "test";

  const [{ createApp }, { closeDatabase }] = await Promise.all([
    import("../src/app"),
    import("../src/models/user.model"),
  ]);
  const server = createApp().listen(0);

  try {
    await once(server, "listening");
    const address = server.address() as AddressInfo;
    const apiOrigin = `http://127.0.0.1:${address.port}`;

    const send = (
      path: string,
      method: string,
      body?: Record<string, unknown>,
      cookie?: string,
      origin = frontendOrigin,
    ) =>
      fetch(`${apiOrigin}${path}`, {
        method,
        headers: {
          Origin: origin,
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...(cookie ? { Cookie: cookie } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

    const invalidRegistration = await send("/api/auth/register", "POST", {
      fullName: "A",
      email: "not-an-email",
      password: "short",
    });
    assert.equal(invalidRegistration.status, 400);
    const invalidBody = (await invalidRegistration.json()) as {
      details: Record<string, string>;
    };
    assert.ok(invalidBody.details.fullName);
    assert.ok(invalidBody.details.email);
    assert.ok(invalidBody.details.password);

    const registration = await send("/api/auth/register", "POST", {
      fullName: "Jordan Lee",
      email: "Jordan@Example.com",
      password: "secure-password-42",
    });
    assert.equal(registration.status, 201);
    const registrationBody = (await registration.json()) as {
      user: Record<string, unknown>;
    };
    assert.equal(registrationBody.user.email, "jordan@example.com");
    assert.equal("passwordHash" in registrationBody.user, false);
    assert.equal("password" in registrationBody.user, false);
    const registrationCookie = registration.headers.get("set-cookie");
    assert.ok(registrationCookie?.includes("HttpOnly"));
    assert.ok(registrationCookie?.includes("SameSite=Lax"));
    assert.ok(registrationCookie?.includes("Path=/api"));

    const duplicate = await send("/api/auth/register", "POST", {
      fullName: "Jordan Lee",
      email: "JORDAN@example.com",
      password: "secure-password-42",
    });
    assert.equal(duplicate.status, 409);

    const invalidLogin = await send("/api/auth/login", "POST", {
      email: "jordan@example.com",
      password: "incorrect-password",
    });
    assert.equal(invalidLogin.status, 401);
    assert.equal(
      ((await invalidLogin.json()) as { error: string }).error,
      "Email or password is incorrect.",
    );

    const unauthorizedProfile = await send("/api/auth/me", "GET");
    assert.equal(unauthorizedProfile.status, 401);

    const disallowedOrigin = await send(
      "/api/auth/login",
      "POST",
      { email: "jordan@example.com", password: "secure-password-42" },
      undefined,
      "https://untrusted.example",
    );
    assert.equal(disallowedOrigin.status, 403);

    const login = await send("/api/auth/login", "POST", {
      email: "jordan@example.com",
      password: "secure-password-42",
    });
    assert.equal(login.status, 200);
    const sessionCookie = login.headers.get("set-cookie");
    assert.ok(sessionCookie?.includes("Max-Age=7200"));
    assert.ok(sessionCookie?.includes("HttpOnly"));
    assert.ok(sessionCookie?.includes("SameSite=Lax"));
    const cookiePair = sessionCookie?.split(";")[0];
    assert.ok(cookiePair);

    const profile = await send("/api/auth/me", "GET", undefined, cookiePair);
    assert.equal(profile.status, 200);
    const profileBody = (await profile.json()) as {
      user: { fullName: string; email: string };
    };
    assert.equal(profileBody.user.fullName, "Jordan Lee");
    assert.equal(profileBody.user.email, "jordan@example.com");

    const rememberedLogin = await send("/api/auth/login", "POST", {
      email: "jordan@example.com",
      password: "secure-password-42",
      rememberMe: true,
    });
    assert.equal(rememberedLogin.status, 200);
    assert.ok(
      rememberedLogin.headers
        .get("set-cookie")
        ?.includes("Max-Age=2592000"),
    );

    const logout = await send(
      "/api/auth/logout",
      "POST",
      {},
      cookiePair,
    );
    assert.equal(logout.status, 204);
    assert.ok(
      logout.headers
        .get("set-cookie")
        ?.includes("Expires=Thu, 01 Jan 1970 00:00:00 GMT"),
    );
    assert.ok(logout.headers.get("set-cookie")?.includes("Path=/api"));

    const loggedOutProfile = await send("/api/auth/me", "GET");
    assert.equal(loggedOutProfile.status, 401);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    closeDatabase();
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});
