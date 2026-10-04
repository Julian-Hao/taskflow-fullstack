import { getDb } from '../db/index.js';
import type { User, UserRecord } from '../types.js';

interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  salt: string;
  created_at: number;
}

function toUser(row: UserRow): User {
  return { id: row.id, username: row.username, createdAt: row.created_at };
}

function toUserRecord(row: UserRow): UserRecord {
  return { ...toUser(row), passwordHash: row.password_hash, salt: row.salt };
}

export const userRepository = {
  /** 按用户名查找（大小写不敏感，依赖列的 COLLATE NOCASE） */
  findByUsername(username: string): UserRecord | null {
    const row = getDb()
      .prepare('SELECT * FROM users WHERE username = ?')
      .get(username) as UserRow | undefined;
    return row ? toUserRecord(row) : null;
  },

  findById(id: string): User | null {
    const row = getDb().prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
    return row ? toUser(row) : null;
  },

  create(input: {
    id: string;
    username: string;
    passwordHash: string;
    salt: string;
    createdAt: number;
  }): User {
    getDb()
      .prepare(
        'INSERT INTO users (id, username, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)',
      )
      .run(input.id, input.username, input.passwordHash, input.salt, input.createdAt);
    return { id: input.id, username: input.username, createdAt: input.createdAt };
  },

  count(): number {
    const row = getDb().prepare('SELECT COUNT(*) AS total FROM users').get() as { total: number };
    return row.total;
  },
};
