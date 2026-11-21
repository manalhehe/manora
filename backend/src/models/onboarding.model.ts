import { getDatabase } from "../database";

export interface OnboardingProfile {
  preferredName: string;
  timezone: string;
}

export interface OnboardingState {
  profile: OnboardingProfile;
  goals: string[];
  activities: string[];
  lifestyle: string[];
  currentStep: number;
  completed: boolean;
  completedAt: string | null;
}

interface DatabaseOnboardingRow {
  preferred_name: string;
  timezone: string;
  current_step: number;
  completed_at: string | null;
}

function ensureDraft(userId: number): boolean {
  const inserted = getDatabase()
    .prepare(`
      INSERT OR IGNORE INTO user_onboarding (user_id, preferred_name)
      SELECT id, full_name
      FROM users
      WHERE id = ?
    `)
    .run(userId);
  return inserted.changes > 0 || getDatabase()
    .prepare("SELECT 1 FROM user_onboarding WHERE user_id = ?")
    .get(userId) !== undefined;
}

function getCodes(
  userId: number,
  table: "onboarding_goals" | "onboarding_activity_preferences" | "onboarding_lifestyle_preferences",
  codeColumn: "goal_code" | "activity_code" | "lifestyle_code",
): string[] {
  const rows = getDatabase()
    .prepare(`SELECT ${codeColumn} AS code FROM ${table} WHERE user_id = ? ORDER BY code`)
    .all(userId) as Array<{ code: string }>;
  return rows.map((row) => row.code);
}

export function getOnboardingState(userId: number): OnboardingState | undefined {
  if (!ensureDraft(userId)) {
    return undefined;
  }

  const row = getDatabase()
    .prepare(`
      SELECT preferred_name, timezone, current_step, completed_at
      FROM user_onboarding
      WHERE user_id = ?
    `)
    .get(userId) as DatabaseOnboardingRow | undefined;

  if (!row) {
    return undefined;
  }

  return {
    profile: {
      preferredName: row.preferred_name,
      timezone: row.timezone,
    },
    goals: getCodes(userId, "onboarding_goals", "goal_code"),
    activities: getCodes(
      userId,
      "onboarding_activity_preferences",
      "activity_code",
    ),
    lifestyle: getCodes(
      userId,
      "onboarding_lifestyle_preferences",
      "lifestyle_code",
    ),
    currentStep: row.current_step,
    completed: row.completed_at !== null,
    completedAt: row.completed_at,
  };
}

export function saveOnboardingProfile(
  userId: number,
  profile: OnboardingProfile,
): OnboardingState | undefined {
  if (!ensureDraft(userId)) {
    return undefined;
  }
  const result = getDatabase()
    .prepare(`
      UPDATE user_onboarding
      SET preferred_name = ?, timezone = ?, current_step = 2,
          completed_at = NULL,
          updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE user_id = ?
    `)
    .run(profile.preferredName, profile.timezone, userId);

  return result.changes > 0 ? getOnboardingState(userId) : undefined;
}

function replaceCodes(
  userId: number,
  table: "onboarding_goals" | "onboarding_activity_preferences" | "onboarding_lifestyle_preferences",
  codeColumn: "goal_code" | "activity_code" | "lifestyle_code",
  codes: string[],
): void {
  const db = getDatabase();
  const replace = db.transaction(() => {
    db.prepare(`DELETE FROM ${table} WHERE user_id = ?`).run(userId);
    const insert = db.prepare(
      `INSERT INTO ${table} (user_id, ${codeColumn}) VALUES (?, ?)`,
    );
    for (const code of codes) {
      insert.run(userId, code);
    }
  });
  replace();
}

export function saveOnboardingGoals(
  userId: number,
  codes: string[],
): OnboardingState | undefined {
  if (!ensureDraft(userId)) {
    return undefined;
  }
  replaceCodes(userId, "onboarding_goals", "goal_code", codes);
  getDatabase()
    .prepare(`
      UPDATE user_onboarding
      SET current_step = 3, completed_at = NULL,
          updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE user_id = ?
    `)
    .run(userId);
  return getOnboardingState(userId);
}

export function saveOnboardingActivities(
  userId: number,
  codes: string[],
): OnboardingState | undefined {
  if (!ensureDraft(userId)) {
    return undefined;
  }
  replaceCodes(
    userId,
    "onboarding_activity_preferences",
    "activity_code",
    codes,
  );
  getDatabase()
    .prepare(`
      UPDATE user_onboarding
      SET current_step = 4, completed_at = NULL,
          updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE user_id = ?
    `)
    .run(userId);
  return getOnboardingState(userId);
}

export function saveOnboardingLifestyle(
  userId: number,
  codes: string[],
): OnboardingState | undefined {
  if (!ensureDraft(userId)) {
    return undefined;
  }
  replaceCodes(
    userId,
    "onboarding_lifestyle_preferences",
    "lifestyle_code",
    codes,
  );
  getDatabase()
    .prepare(`
      UPDATE user_onboarding
      SET completed_at = NULL,
          updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE user_id = ?
    `)
    .run(userId);
  return getOnboardingState(userId);
}

export function completeOnboarding(
  userId: number,
): OnboardingState | undefined {
  if (!ensureDraft(userId)) {
    return undefined;
  }
  const state = getOnboardingState(userId);
  if (!state) {
    return undefined;
  }

  const complete = getDatabase().transaction(() => {
    getDatabase()
      .prepare(`
        UPDATE user_onboarding
        SET completed_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
            updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE user_id = ?
      `)
      .run(userId);
  });
  complete();
  return getOnboardingState(userId);
}
