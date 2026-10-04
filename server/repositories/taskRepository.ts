import { getDb } from '../db/index.js';
import type { Priority, Task } from '../types.js';
import type { UpdateTaskInput } from '../lib/validation.js';

interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  notes: string;
  category: string;
  priority: Priority;
  due_date: string;
  done: number;
  created_at: number;
  updated_at: number;
}

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    notes: row.notes,
    category: row.category,
    priority: row.priority,
    dueDate: row.due_date,
    done: row.done === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** camelCase 字段 → 数据库列名，同时充当更新时的白名单 */
const COLUMN_MAP: Record<keyof UpdateTaskInput, string> = {
  title: 'title',
  notes: 'notes',
  category: 'category',
  priority: 'priority',
  dueDate: 'due_date',
  done: 'done',
};

function findById(id: string, userId: string): Task | null {
  const row = getDb()
    .prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
    .get(id, userId) as TaskRow | undefined;
  return row ? toTask(row) : null;
}

export const taskRepository = {
  /** 未完成在前，其次按创建时间倒序 */
  listByUser(userId: string): Task[] {
    const rows = getDb()
      .prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY done ASC, created_at DESC')
      .all(userId) as TaskRow[];
    return rows.map(toTask);
  },

  findById,

  create(task: Task): Task {
    getDb()
      .prepare(
        `INSERT INTO tasks (id, user_id, title, notes, category, priority, due_date, done, created_at, updated_at)
         VALUES (@id, @userId, @title, @notes, @category, @priority, @dueDate, @done, @createdAt, @updatedAt)`,
      )
      .run({
        id: task.id,
        userId: task.userId,
        title: task.title,
        notes: task.notes,
        category: task.category,
        priority: task.priority,
        dueDate: task.dueDate,
        done: task.done ? 1 : 0,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      });
    return task;
  },

  /**
   * 局部更新。只允许白名单字段进入 SET 子句，避免 SQL 注入。
   * 返回更新后的任务；任务不存在（或不属于该用户）时返回 null。
   */
  update(id: string, userId: string, patch: UpdateTaskInput): Task | null {
    const assignments: string[] = [];
    const values: unknown[] = [];

    for (const [field, column] of Object.entries(COLUMN_MAP) as [keyof UpdateTaskInput, string][]) {
      const value = patch[field];
      if (value === undefined) continue;
      assignments.push(`${column} = ?`);
      values.push(typeof value === 'boolean' ? (value ? 1 : 0) : value);
    }

    if (assignments.length > 0) {
      assignments.push('updated_at = ?');
      values.push(Date.now(), id, userId);
      getDb()
        .prepare(`UPDATE tasks SET ${assignments.join(', ')} WHERE id = ? AND user_id = ?`)
        .run(...values);
    }

    return findById(id, userId);
  },

  /** 返回是否真的删掉了一行 */
  remove(id: string, userId: string): boolean {
    const result = getDb()
      .prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?')
      .run(id, userId);
    return result.changes > 0;
  },

  countByUser(userId: string): number {
    const row = getDb()
      .prepare('SELECT COUNT(*) AS total FROM tasks WHERE user_id = ?')
      .get(userId) as { total: number };
    return row.total;
  },
};
