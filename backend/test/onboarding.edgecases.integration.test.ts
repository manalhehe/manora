import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { test } from "node:test";
import type { AddressInfo } from "node:net";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

test("Phase 2 database data survives onboarding migration", async () => {
  const tempDirectory = mkdtempSync(join(tmpdir(), "manora-migration-"));
  const databasePath = join(tempDirectory, "phase2.sqlite");
  const phaseTwoDatabase = new Database(databasePath);
  phaseTwoDatabase.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL COLLATE NOCASE UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
  `);
  const passwordHash = await bcrypt.hash("phase-two-password", 12);
  phaseTwoDatabase.prepare(`
    INSERT INTO users (id, full_name, email, password_hash)
    VALUES (?, ?, ?, ?)
  `).run(42, "Existing User", "existing@example.com", passwordHash);
  phaseTwoDatabase.close();

  process.env.DATABASE_PATH = databasePath;
  process.env.FRONTEND_ORIGIN = "http://localhost:5173";
  process.env.JWT_SECRET = randomBytes(32).toString("hex");
  process.env.NODE_ENV = "test";

  const [{ getDatabase, closeDatabase }] = await Promise.all([
    import("../src/database"),
  ]);

  try {
    const db = getDatabase();
    const existing = db.prepare(
      "SELECT id, full_name, email, password_hash FROM users WHERE id = ?",
    ).get(42) as {
      id: number;
      full_name: string;
      email: string;
      password_hash: string;
    };
    assert.equal(existing.full_name, "Existing User");
    assert.equal(existing.email, "existing@example.com");
    assert.equal(existing.password_hash, passwordHash);

    const onboardingTables = db.prepare(`
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
        AND name IN (
          'user_onboarding',
          'onboarding_goals',
          'onboarding_activity_preferences',
          'onboarding_lifestyle_preferences'
        )
    `).all() as Array<{ name: string }>;
    assert.equal(onboardingTables.length, 4);
  } finally {
    closeDatabase();
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});

test("cascade deletion, stale JWT subjects, and preference rollback", async () => {
  const tempDirectory = mkdtempSync(join(tmpdir(), "manora-edgecases-"));
  const frontendOrigin = "http://localhost:5173";
  process.env.DATABASE_PATH = join(tempDirectory, "edgecases.sqlite");
  process.env.FRONTEND_ORIGIN = frontendOrigin;
  process.env.JWT_SECRET = randomBytes(32).toString("hex");
  process.env.NODE_ENV = "test";

  const [
    { createApp },
    { closeDatabase, getDatabase },
    onboardingModel,
  ] = await Promise.all([
    import("../src/app"),
    import("../src/database"),
    import("../src/models/onboarding.model"),
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
    ) =>
      fetch(`${apiOrigin}${path}`, {
        method,
        headers: {
          Origin: frontendOrigin,
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...(cookie ? { Cookie: cookie } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

    const register = await send("/api/auth/register", "POST", {
      fullName: "Cascade User",
      email: "cascade@example.com",
      password: "secure-password-42",
    });
    assert.equal(register.status, 201);
    const setCookie = register.headers.get("set-cookie");
    assert.ok(setCookie);
    const cookie = setCookie?.split(";")[0];
    assert.ok(cookie);

    const me = await send("/api/auth/me", "GET", undefined, cookie);
    assert.equal(me.status, 200);
    const meBody = (await me.json()) as { user: { id: number } };
    const userId = meBody.user.id;

    assert.ok(
      onboardingModel.saveOnboardingProfile(userId, {
        preferredName: "Cascade User",
        timezone: "UTC",
      }),
    );
    assert.ok(
      onboardingModel.saveOnboardingActivities(userId, ["walking"]),
    );

    const db = getDatabase();
    db.exec(`
      CREATE TRIGGER fail_activity_insert
      BEFORE INSERT ON onboarding_activity_preferences
      WHEN NEW.activity_code = 'yoga'
      BEGIN
        SELECT RAISE(ABORT, 'forced preference failure');
      END;
    `);
    assert.throws(
      () =>
        onboardingModel.saveOnboardingActivities(userId, [
          "walking",
          "yoga",
        ]),
      /forced preference failure/,
    );
    db.exec("DROP TRIGGER fail_activity_insert;");

    const rolledBackActivities = db.prepare(`
      SELECT activity_code
      FROM onboarding_activity_preferences
      WHERE user_id = ?
      ORDER BY activity_code
    `).all(userId) as Array<{ activity_code: string }>;
    assert.deepEqual(
      rolledBackActivities.map((row) => row.activity_code),
      ["walking"],
    );

    db.prepare("DELETE FROM users WHERE id = ?").run(userId);

    for (const table of [
      "user_onboarding",
      "onboarding_goals",
      "onboarding_activity_preferences",
      "onboarding_lifestyle_preferences",
    ]) {
      const remaining = db.prepare(
        `SELECT COUNT(*) AS count FROM ${table} WHERE user_id = ?`,
      ).get(userId) as { count: number };
      assert.equal(remaining.count, 0);
    }

    const staleDraft = await send(
      "/api/onboarding",
      "GET",
      undefined,
      cookie,
    );
    assert.equal(staleDraft.status, 401);

    const staleMutation = await send(
      "/api/onboarding/profile",
      "PUT",
      { preferredName: "Stale User", timezone: "UTC" },
      cookie,
    );
    assert.equal(staleMutation.status, 401);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    closeDatabase();
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});
