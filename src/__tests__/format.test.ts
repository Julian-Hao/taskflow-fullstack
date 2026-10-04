import { describe, expect, it } from 'vitest';
import { computeStats, dateOffset, describeDue, filterTasks } from '../lib/format';
import { DEFAULT_FILTER, type Task } from '../types';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    userId: 'user-1',
    title: '写周报',
    notes: '',
    category: '工作',
    priority: 'medium',
    dueDate: '',
    done: false,
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

describe('describeDue', () => {
  it('空日期返回 null', () => {
    expect(describeDue('')).toBeNull();
  });

  it('识别今天/明天/昨天', () => {
    expect(describeDue(dateOffset(0))).toEqual({ label: '今天', overdue: false });
    expect(describeDue(dateOffset(1))).toEqual({ label: '明天', overdue: false });
    expect(describeDue(dateOffset(-1))).toEqual({ label: '昨天', overdue: true });
  });

  it('其他日期显示为 M月D日，过去日期标记逾期', () => {
    expect(describeDue('2026-03-09')).toEqual({ label: '3月9日', overdue: true });
  });
});

describe('filterTasks', () => {
  const tasks = [
    makeTask({ id: 'a', title: '写周报', category: '工作', priority: 'high', done: false }),
    makeTask({ id: 'b', title: '读一本书', category: '学习', priority: 'low', done: true }),
    makeTask({ id: 'c', title: '买菜', notes: '顺便买牛奶', category: '生活', priority: 'medium', done: false }),
  ];

  it('默认筛选返回全部', () => {
    expect(filterTasks(tasks, DEFAULT_FILTER)).toHaveLength(3);
  });

  it('按状态筛选', () => {
    expect(filterTasks(tasks, { ...DEFAULT_FILTER, status: 'todo' }).map((t) => t.id)).toEqual(['a', 'c']);
    expect(filterTasks(tasks, { ...DEFAULT_FILTER, status: 'done' }).map((t) => t.id)).toEqual(['b']);
  });

  it('按分类与优先级筛选', () => {
    expect(filterTasks(tasks, { ...DEFAULT_FILTER, category: '工作' }).map((t) => t.id)).toEqual(['a']);
    expect(filterTasks(tasks, { ...DEFAULT_FILTER, priority: 'low' }).map((t) => t.id)).toEqual(['b']);
  });

  it('搜索同时匹配标题与备注，且忽略大小写', () => {
    expect(filterTasks(tasks, { ...DEFAULT_FILTER, query: '周报' }).map((t) => t.id)).toEqual(['a']);
    expect(filterTasks(tasks, { ...DEFAULT_FILTER, query: '牛奶' }).map((t) => t.id)).toEqual(['c']);
  });

  it('多个条件叠加', () => {
    const result = filterTasks(tasks, { ...DEFAULT_FILTER, status: 'todo', category: '生活' });
    expect(result.map((t) => t.id)).toEqual(['c']);
  });
});

describe('computeStats', () => {
  it('空列表完成率为 0', () => {
    expect(computeStats([])).toEqual({ total: 0, done: 0, todo: 0, completionRate: 0 });
  });

  it('正确统计数量与完成率', () => {
    const stats = computeStats([
      makeTask({ id: 'a', done: true }),
      makeTask({ id: 'b', done: false }),
      makeTask({ id: 'c', done: true }),
    ]);

    expect(stats.total).toBe(3);
    expect(stats.done).toBe(2);
    expect(stats.todo).toBe(1);
    expect(stats.completionRate).toBe(67);
  });
});
