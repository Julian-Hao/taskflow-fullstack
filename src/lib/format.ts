import type { Priority, Task, TaskFilter } from '../types';

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** 相对今天偏移若干天的 YYYY-MM-DD（本地时区） */
export function dateOffset(days = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export interface DueDescription {
  label: string;
  overdue: boolean;
}

/** 把 YYYY-MM-DD 转成「今天 / 明天 / 昨天 / M月D日」并判断是否已逾期 */
export function describeDue(dueDate: string): DueDescription | null {
  if (!dueDate) return null;

  const today = dateOffset(0);
  let label: string;

  if (dueDate === today) label = '今天';
  else if (dueDate === dateOffset(1)) label = '明天';
  else if (dueDate === dateOffset(-1)) label = '昨天';
  else label = `${Number(dueDate.slice(5, 7))}月${Number(dueDate.slice(8, 10))}日`;

  return { label, overdue: dueDate < today };
}

/** 按筛选条件过滤任务（纯函数，便于单测） */
export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  const query = filter.query.trim().toLowerCase();

  return tasks.filter((task) => {
    if (filter.status === 'todo' && task.done) return false;
    if (filter.status === 'done' && !task.done) return false;
    if (filter.category !== 'all' && task.category !== filter.category) return false;
    if (filter.priority !== 'all' && task.priority !== filter.priority) return false;
    if (query && !`${task.title} ${task.notes}`.toLowerCase().includes(query)) return false;
    return true;
  });
}

export interface TaskStats {
  total: number;
  done: number;
  todo: number;
  completionRate: number;
}

export function computeStats(tasks: Task[]): TaskStats {
  const total = tasks.length;
  const done = tasks.filter((task) => task.done).length;
  return {
    total,
    done,
    todo: total - done,
    completionRate: total === 0 ? 0 : Math.round((done / total) * 100),
  };
}
