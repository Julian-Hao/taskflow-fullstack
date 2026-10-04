import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { config } from '../config.js';
import { SCHEMA } from './schema.js';

export type Db = InstanceType<typeof Database>;

let instance: Db | null = null;

/**
 * 获取（并惰性初始化）数据库连接。全进程共用一个实例。
 * WAL 模式提升并发读性能；外键约束默认关闭，这里显式打开。
 */
export function getDb(): Db {
  if (instance) return instance;

  if (config.dbFile !== ':memory:') {
    fs.mkdirSync(path.dirname(config.dbFile), { recursive: true });
  }

  const db = new Database(config.dbFile);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);

  instance = db;
  return db;
}

/** 关闭连接（测试与优雅退出时调用） */
export function closeDb(): void {
  instance?.close();
  instance = null;
}
