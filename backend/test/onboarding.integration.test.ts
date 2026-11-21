import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { test } from "node:test";
import type { AddressInfo } from "node:net";

test("session cookie jar sends authentication to onboarding routes", async () => {
  const tempDirectory = mkdtempSync(join(tmpdir(), "manora-cookie-jar-"));
  const frontendOrigin = "http://localhost:5173";
  process.env.DATABASE_PATH = join(tempDirectory, "cookie.jar.sqlite");
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
    let cookiePair: string | undefined;

    const jarFetch = async (
      path: string,
      method: string,
      body?: Record<string, unknown>,
    ) => {
      const response = await fetch(`${apiOrigin}${path}`, {
        method,
        headers: {
          Origin: frontendOrigin,
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...(path.startsWith("/api/") && cookiePair
            ? { Cookie: cookiePair }
            : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const setCookie = response.headers.get("set-cookie");
      if (setCookie?.includes("Path=/api")) {
        cookiePair = setCookie.split(";")[0];
      }
      return response;
    };

    const registration = await jarFetch("/api/auth/register", "POST", {
      fullName: "Cookie Jar User",
      email: "cookie-jar@example.com",
      password: "secure-password-42",
    });
    assert.equal(registration.status, 201);
    assert.ok(cookiePair);

    const onboarding = await jarFetch("/api/onboarding", "GET");
    assert.equal(onboarding.status, 200);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    closeDatabase();
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});

test("onboarding drafts, validation, completion, and user isolation", async () => {
  const tempDirectory = mkdtempSync(join(tmpdir(), "manora-onboarding-"));
  const frontendOrigin = "http://localhost:5173";
  process.env.DATABASE_PATH = join(tempDirectory, "onboarding.sqlite");
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

    const register = async (fullName: string, email: string) => {
      const response = await send("/api/auth/register", "POST", {
        fullName,
        email,
        password: "secure-password-42",
      });
      assert.equal(response.status, 201);
      const setCookie = response.headers.get("set-cookie");
      assert.ok(setCookie);
      const cookie = setCookie?.split(";")[0];
      assert.ok(cookie);
      return cookie;
    };

    const jordanCookie = await register(
      "Jordan Lee",
      "jordan-onboarding@example.com",
    );
    const alexCookie = await register(
      "Alex Morgan",
      "alex-onboarding@example.com",
    );

    const unauthorizedDraft = await send("/api/onboarding", "GET");
    assert.equal(unauthorizedDraft.status, 401);

    const mutationRequests: Array<{
      path: string;
      method: string;
      body: Record<string, unknown>;
    }> = [
      {
        path: "/api/onboarding/profile",
        method: "PUT",
        body: { preferredName: "Cross Origin", timezone: "UTC" },
      },
      {
        path: "/api/onboarding/goals",
        method: "PUT",
        body: { goals: ["better_sleep"] },
      },
      {
        path: "/api/onboarding/activities",
        method: "PUT",
        body: { activities: ["walking"] },
      },
      {
        path: "/api/onboarding/lifestyle",
        method: "PUT",
        body: { lifestyle: ["morning"] },
      },
      {
        path: "/api/onboarding/complete",
        method: "POST",
        body: {},
      },
    ];
    for (const mutation of mutationRequests) {
      const rejected = await send(
        mutation.path,
        mutation.method,
        mutation.body,
        jordanCookie,
        "https://untrusted.example",
      );
      assert.equal(rejected.status, 403);
    }

    const jordanDraftResponse = await send(
      "/api/onboarding",
      "GET",
      undefined,
      jordanCookie,
    );
    assert.equal(jordanDraftResponse.status, 200);
    const jordanDraftBody = (await jordanDraftResponse.json()) as {
      onboarding: {
        profile: { preferredName: string; timezone: string };
        currentStep: number;
        completed: boolean;
      };
    };
    assert.equal(jordanDraftBody.onboarding.profile.preferredName, "Jordan Lee");
    assert.equal(jordanDraftBody.onboarding.currentStep, 1);
    assert.equal(jordanDraftBody.onboarding.completed, false);

    const incompleteCompletion = await send(
      "/api/onboarding/complete",
      "POST",
      {},
      jordanCookie,
    );
    assert.equal(incompleteCompletion.status, 400);

    const invalidProfile = await send(
      "/api/onboarding/profile",
      "PUT",
      { preferredName: "J", timezone: "" },
      jordanCookie,
    );
    assert.equal(invalidProfile.status, 400);
    assert.ok(
      ((await invalidProfile.json()) as { details: Record<string, string> })
        .details.preferredName,
    );

    const disallowedOrigin = await send(
      "/api/onboarding/profile",
      "PUT",
      { preferredName: "Jordan", timezone: "UTC" },
      jordanCookie,
      "https://untrusted.example",
    );
    assert.equal(disallowedOrigin.status, 403);

    const profile = await send(
      "/api/onboarding/profile",
      "PUT",
      { preferredName: "Jordan", timezone: "Europe/London" },
      jordanCookie,
    );
    assert.equal(profile.status, 200);
    const profileBody = (await profile.json()) as {
      onboarding: { currentStep: number };
    };
    assert.equal(profileBody.onboarding.currentStep, 2);

    const invalidGoal = await send(
      "/api/onboarding/goals",
      "PUT",
      { goals: ["unknown_goal"] },
      jordanCookie,
    );
    assert.equal(invalidGoal.status, 400);

    const goals = await send(
      "/api/onboarding/goals",
      "PUT",
      { goals: ["better_sleep", "general_wellbeing"] },
      jordanCookie,
    );
    assert.equal(goals.status, 200);
    const goalsBody = (await goals.json()) as {
      onboarding: { currentStep: number };
    };
    assert.equal(goalsBody.onboarding.currentStep, 3);

    const activities = await send(
      "/api/onboarding/activities",
      "PUT",
      { activities: ["walking", "yoga"] },
      jordanCookie,
    );
    assert.equal(activities.status, 200);
    const activitiesBody = (await activities.json()) as {
      onboarding: { currentStep: number };
    };
    assert.equal(activitiesBody.onboarding.currentStep, 4);

    const lifestyle = await send(
      "/api/onboarding/lifestyle",
      "PUT",
      { lifestyle: ["morning", "short_sessions", "outdoors"] },
      jordanCookie,
    );
    assert.equal(lifestyle.status, 200);

    const completion = await send(
      "/api/onboarding/complete",
      "POST",
      {},
      jordanCookie,
    );
    assert.equal(completion.status, 200);
    const completionBody = (await completion.json()) as {
      onboarding: { completed: boolean; completedAt: string | null };
    };
    assert.equal(completionBody.onboarding.completed, true);
    assert.ok(completionBody.onboarding.completedAt);

    const alexDraftResponse = await send(
      "/api/onboarding",
      "GET",
      undefined,
      alexCookie,
    );
    assert.equal(alexDraftResponse.status, 200);
    const alexDraftBody = (await alexDraftResponse.json()) as {
      onboarding: {
        profile: { preferredName: string };
        goals: string[];
        completed: boolean;
      };
    };
    assert.equal(alexDraftBody.onboarding.profile.preferredName, "Alex Morgan");
    assert.deepEqual(alexDraftBody.onboarding.goals, []);
    assert.equal(alexDraftBody.onboarding.completed, false);

    const jordanAfterCompletion = await send(
      "/api/onboarding",
      "GET",
      undefined,
      jordanCookie,
    );
    const jordanAfterCompletionBody =
      (await jordanAfterCompletion.json()) as {
        onboarding: {
          profile: { preferredName: string };
          goals: string[];
          activities: string[];
          lifestyle: string[];
        };
      };
    assert.equal(
      jordanAfterCompletionBody.onboarding.profile.preferredName,
      "Jordan",
    );
    assert.deepEqual(jordanAfterCompletionBody.onboarding.goals, [
      "better_sleep",
      "general_wellbeing",
    ]);
    assert.deepEqual(jordanAfterCompletionBody.onboarding.activities, [
      "walking",
      "yoga",
    ]);

    const crossUserAttempt = await send(
      "/api/onboarding/profile",
      "PUT",
      {
        preferredName: "Unauthorized Update",
        timezone: "UTC",
        userId: jordanAfterCompletionBody.onboarding.profile.preferredName,
      },
      alexCookie,
    );
    assert.equal(crossUserAttempt.status, 200);

    const jordanAfterCrossUserAttempt = await send(
      "/api/onboarding",
      "GET",
      undefined,
      jordanCookie,
    );
    assert.equal(jordanAfterCrossUserAttempt.status, 200);
    const jordanAfterCrossUserAttemptBody =
      (await jordanAfterCrossUserAttempt.json()) as {
        onboarding: { profile: { preferredName: string } };
      };
    assert.equal(
      jordanAfterCrossUserAttemptBody.onboarding.profile.preferredName,
      "Jordan",
    );

    const editCompletedDraft = await send(
      "/api/onboarding/profile",
      "PUT",
      { preferredName: "Jordan Edited", timezone: "Europe/London" },
      jordanCookie,
    );
    assert.equal(editCompletedDraft.status, 200);
    const editedDraft = await send(
      "/api/onboarding",
      "GET",
      undefined,
      jordanCookie,
    );
    const editedDraftBody = (await editedDraft.json()) as {
      onboarding: { completed: boolean };
    };
    assert.equal(editedDraftBody.onboarding.completed, false);

    const repeatedCompletion = await send(
      "/api/onboarding/complete",
      "POST",
      {},
      jordanCookie,
    );
    assert.equal(repeatedCompletion.status, 200);
    const repeatedCompletionBody = (await repeatedCompletion.json()) as {
      onboarding: { completed: boolean };
    };
    assert.equal(repeatedCompletionBody.onboarding.completed, true);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    closeDatabase();
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});
