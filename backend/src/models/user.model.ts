import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { getConfig } from "../config/env";

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
}

interface UserRecord extends UserProfile {
  passwordHash: string;
}

interface DatabaseUser {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

let database: Database.Database | undefined;

function getDatabase(): Database.Database {
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
    )
  `);
  return database;
}

function mapUser(row: DatabaseUser): UserRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

const userSelect = `
  SELECT id, full_name, email, password_hash, created_at
  FROM users
`;

export function findUserByEmail(email: string): UserRecord | undefined {
  const row = getDatabase()
    .prepare(`${userSelect} WHERE email = ?`)
    .get(email) as DatabaseUser | undefined;
  return row ? mapUser(row) : undefined;
}

export function findUserById(id: number): UserProfile | undefined {
  const row = getDatabase()
    .prepare("SELECT id, full_name, email, created_at FROM users WHERE id = ?")
    .get(id) as Omit<DatabaseUser, "password_hash"> | undefined;
  return row
    ? {
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        createdAt: row.created_at,
      }
    : undefined;
}

export function createUser(
  fullName: string,
  email: string,
  passwordHash: string,
): UserProfile | undefined {
  const result = getDatabase()
    .prepare(`
      INSERT INTO users (full_name, email, password_hash)
      VALUES (?, ?, ?)
      ON CONFLICT(email) DO NOTHING
    `)
    .run(fullName, email, passwordHash);

  if (result.changes === 0) {
    return undefined;
  }
  return findUserById(Number(result.lastInsertRowid));
}

export function closeDatabase(): void {
  database?.close();
  database = undefined;
}
