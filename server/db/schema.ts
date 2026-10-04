/**
 * 建表语句。幂等（IF NOT EXISTS），服务启动时自动执行。
 * 会话表通过外键级联删除，避免用户注销后残留 token。
 */
export const SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            TEXT    PRIMARY KEY,
  username      TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT    NOT NULL,
  salt          TEXT    NOT NULL,
  created_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT    PRIMARY KEY,
  user_id    TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS tasks (
  id         TEXT    PRIMARY KEY,
  user_id    TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT    NOT NULL,
  notes      TEXT    NOT NULL DEFAULT '',
  category   TEXT    NOT NULL DEFAULT '个人',
  priority   TEXT    NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  due_date   TEXT    NOT NULL DEFAULT '',
  done       INTEGER NOT NULL DEFAULT 0 CHECK (done IN (0,1)),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
`;
