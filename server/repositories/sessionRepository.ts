import { getDb } from '../db/index.js';

interface SessionRow {
  token: string;
  user_id: string;
  created_at: number;
}

export const sessionRepository = {
  create(token: string, userId: string, createdAt: number): void {
    getDb()
      .prepare('INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)')
      .run(token, userId, createdAt);
  },

  findUserId(token: string): string | null {
    const row = getDb().prepare('SELECT * FROM sessions WHERE token = ?').get(token) as
      | SessionRow
      | undefined;
    return row ? row.user_id : null;
  },

  delete(token: string): void {
    getDb().prepare('DELETE FROM sessions WHERE token = ?').run(token);
  },

  /** 清理超过有效期的会话，返回清理条数 */
  deleteExpired(now: number, ttlMs: number): number {
    const result = getDb()
      .prepare('DELETE FROM sessions WHERE created_at < ?')
      .run(now - ttlMs);
    return result.changes;
  },
};
