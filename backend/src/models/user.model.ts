import { closeDatabase as closeSharedDatabase, getDatabase } from "../database";

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
  closeSharedDatabase();
}
