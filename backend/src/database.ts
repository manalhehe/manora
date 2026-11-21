import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { getConfig } from "./config/env";

let database: Database.Database | undefined;

export function getDatabase(): Database.Database {
  if (database) {
    return database;
  }

  const databasePath = getConfig().databasePath;
  mkdirSync(dirname(databasePath), { recursive: true });
  database = new Database(databasePath);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  database.pragma("busy_timeout = 5000");
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL COLLATE NOCASE UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS user_onboarding (
      user_id INTEGER PRIMARY KEY,
      preferred_name TEXT NOT NULL DEFAULT '',
      timezone TEXT NOT NULL DEFAULT '',
      current_step INTEGER NOT NULL DEFAULT 1
        CHECK (current_step BETWEEN 1 AND 4),
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS onboarding_goals (
      user_id INTEGER NOT NULL,
      goal_code TEXT NOT NULL,
      PRIMARY KEY (user_id, goal_code),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS onboarding_activity_preferences (
      user_id INTEGER NOT NULL,
      activity_code TEXT NOT NULL,
      PRIMARY KEY (user_id, activity_code),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS onboarding_lifestyle_preferences (
      user_id INTEGER NOT NULL,
      lifestyle_code TEXT NOT NULL,
      PRIMARY KEY (user_id, lifestyle_code),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  return database;
}

export function closeDatabase(): void {
  database?.close();
  database = undefined;
}
